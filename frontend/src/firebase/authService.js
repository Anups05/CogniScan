// src/firebase/authService.js
// Handles Phone OTP authentication and Firestore profile saving.

import {
  RecaptchaVerifier,
  signInWithPhoneNumber,
} from 'firebase/auth';
import { doc, setDoc, getDoc, serverTimestamp, collection, query, where, getDocs } from 'firebase/firestore';
import { auth, db } from './config';

// ── OTP ─────────────────────────────────────────────────────────────────────

/**
 * Sets up an invisible reCAPTCHA on the given button element ID.
 * Must be called before sending OTP. Call once per page load.
 */
export const setupRecaptcha = (buttonId) => {
  // Clear any existing verifier to avoid "Firebase: already exists" error
  if (window.recaptchaVerifier) {
    window.recaptchaVerifier.clear();
  }
  window.recaptchaVerifier = new RecaptchaVerifier(auth, buttonId, {
    size: 'invisible',
    callback: () => {}, // reCAPTCHA solved automatically
  });
  return window.recaptchaVerifier;
};

/**
 * Sends OTP to a phone number.
 * @param {string} phoneNumber - Full E.164 format, e.g. "+919876543210"
 * @returns {ConfirmationResult} - Used to verify the OTP next
 */
export const sendOtp = async (phoneNumber) => {
  const verifier = setupRecaptcha('send-otp-btn');
  const confirmationResult = await signInWithPhoneNumber(auth, phoneNumber, verifier);
  window.confirmationResult = confirmationResult; // Store globally for verification step
  return confirmationResult;
};

/**
 * Verifies the OTP entered by the user.
 * @param {string} otp - 6-digit code
 * @returns {UserCredential}
 */
export const verifyOtp = async (otp) => {
  if (!window.confirmationResult) {
    throw new Error('No OTP request found. Please request OTP first.');
  }
  return await window.confirmationResult.confirm(otp);
};

// ── Firestore Profile Saving ─────────────────────────────────────────────────

/**
 * Saves the complete registration details to Firestore.
 * Creates documents in: users/{uid}, caregivers/{uid}, patients/{patientPhone}
 *
 * @param {string} uid - Firebase Auth user ID
 * @param {object} patientData - All patient form fields
 * @param {object} caregiverData - All caregiver form fields
 */
export const saveRegistrationToFirestore = async (uid, patientData, caregiverData) => {
  const patientFullName = [patientData.firstName, patientData.middleName, patientData.lastName]
    .filter(Boolean)
    .join(' ');
  const caregiverFullName = [caregiverData.firstName, caregiverData.middleName, caregiverData.lastName]
    .filter(Boolean)
    .join(' ');

  // 1. Save base user document (caregiver's auth record)
  await setDoc(doc(db, 'users', uid), {
    uid,
    phone: caregiverData.phone,
    role: 'caregiver',
    name: caregiverFullName,
    email: caregiverData.email,
    createdAt: serverTimestamp(),
  });

  // 2. Save caregiver profile with relation details
  await setDoc(doc(db, 'caregivers', uid), {
    uid,
    firstName: caregiverData.firstName,
    middleName: caregiverData.middleName || '',
    lastName: caregiverData.lastName,
    fullName: caregiverFullName,
    email: caregiverData.email,
    phone: `+91${caregiverData.phone}`,
    relation: caregiverData.relation,
    createdAt: serverTimestamp(),
  });

  // 3. Save patient profile (keyed by their phone number as document ID for easy lookup)
  const patientDocId = `patient_${patientData.phone.replace(/\s/g, '')}`;
  await setDoc(doc(db, 'patients', patientDocId), {
    firstName: patientData.firstName,
    middleName: patientData.middleName || '',
    lastName: patientData.lastName,
    fullName: patientFullName,
    age: parseInt(patientData.age, 10) || 0,
    email: patientData.email || '',
    phone: `+91${patientData.phone}`,
    caregiverId: uid,
    createdAt: serverTimestamp(),
    // Cognitive tracking fields initialized to defaults
    currentStreak: 0,
    lastSessionDate: null,
    totalTestsTaken: 0,
  });

  // 4. Save patient pre-registration record keyed by phone (no uid yet — assigned on first login)
  //    This allows us to identify the patient when they first log in via OTP.
  const patientPhoneDigits = patientData.phone.replace(/\s/g, '');
  await setDoc(doc(db, 'patient_registrations', patientPhoneDigits), {
    phone: `+91${patientPhoneDigits}`,
    fullName: patientFullName,
    firstName: patientData.firstName,
    middleName: patientData.middleName || '',
    lastName: patientData.lastName,
    age: parseInt(patientData.age, 10) || 0,
    email: patientData.email || '',
    caregiverId: uid,
    patientDocId,
    createdAt: serverTimestamp(),
    // Will be updated when the patient first logs in
    linkedUid: null,
  });

  return { patientDocId };
};

/**
 * Fetches a user's profile and linked patient data from Firestore.
 * @param {string} uid - Firebase Auth user ID
 * @returns {{ user, caregiver, patient } | null}
 */
export const fetchUserProfile = async (uid) => {
  const userSnap = await getDoc(doc(db, 'users', uid));
  if (!userSnap.exists()) return null;

  const userData = userSnap.data();
  if (userData.role === 'caregiver') {
    const caregiverSnap = await getDoc(doc(db, 'caregivers', uid));
    return {
      user: userData,
      caregiver: caregiverSnap.data() || null,
    };
  }
  return { user: userData };
};

/**
 * Looks up a patient profile in Firestore by their phone number.
 * Patient doc IDs are stored as "patient_{phone}" (digits only, no +91).
 * @param {string} phoneE164 - e.g. "+919987639765"
 * @returns {object|null} Patient profile data for Zustand, or null if not found
 */
export const lookupPatientByPhone = async (uid, phoneE164) => {
  // Strip +91 prefix to construct the doc ID used during registration
  const digits = phoneE164.replace('+91', '').replace(/\s/g, '');
  const patientDocId = `patient_${digits}`;

  const patientSnap = await getDoc(doc(db, 'patients', patientDocId));
  if (!patientSnap.exists()) return null;

  const p = patientSnap.data();
  return {
    uid,
    phone: digits,
    // Fields used across Dashboard, Settings, Sidebar
    name: p.fullName || `${p.firstName} ${p.lastName}`,
    firstName: p.firstName,
    middleName: p.middleName || '',
    lastName: p.lastName,
    age: p.age,
    email: p.email || '',
    patientPhone: p.phone,
    currentStreak: p.currentStreak || 0,
    lastSessionDate: p.lastSessionDate || null,
    caregiverId: p.caregiverId || null,
    role: 'patient',
  };
};

/**
 * Looks up a caregiver profile AND their linked patient from Firestore by UID.
 * @param {string} uid - Firebase Auth UID (from after OTP verify or registration)
 * @returns {object|null} Merged caregiver + patient data for Zustand
 */
export const lookupCaregiverByUid = async (uid) => {
  const [userSnap, caregiverSnap] = await Promise.all([
    getDoc(doc(db, 'users', uid)),
    getDoc(doc(db, 'caregivers', uid)),
  ]);

  if (!userSnap.exists()) return null;

  const u = userSnap.data();
  const c = caregiverSnap.exists() ? caregiverSnap.data() : {};

  // Look up linked patient by caregiverId == uid
  let patientData = {};
  const q = query(collection(db, 'patients'), where('caregiverId', '==', uid));
  const patientDocs = await getDocs(q);

  if (!patientDocs.empty) {
    patientData = patientDocs.docs[0].data();
  }

  return {
    uid,
    role: 'caregiver',
    // Caregiver fields
    name: c.fullName || u.name || 'Caregiver',
    firstName: c.firstName || '',
    middleName: c.middleName || '',
    lastName: c.lastName || '',
    email: c.email || u.email || '',
    phone: c.phone ? c.phone.replace('+91', '') : u.phone || '',
    relation: c.relation || '',
    // Linked patient fields (used in Dashboard greeting and Settings)
    patientName: patientData.fullName || `${patientData.firstName || ''} ${patientData.lastName || ''}`.trim(),
    patientFirstName: patientData.firstName || '',
    patientLastName: patientData.lastName || '',
    patientAge: patientData.age || '',
    patientEmail: patientData.email || '',
    patientPhone: patientData.phone ? patientData.phone.replace('+91', '') : '',
    patientDocId: patientDocs.empty ? null : patientDocs.docs[0].id,
  };
};

/**
 * Called after a patient verifies their OTP for the first time.
 * 1. Looks up their pre-registration in patient_registrations/{phoneDigits}
 * 2. Creates their users/{uid} doc in Firestore
 * 3. Links the uid back to the registration record
 * @param {string} uid - Firebase Auth UID after OTP verify
 * @param {string} phoneE164 - e.g. "+919987639765"
 * @returns {object} Profile for Zustand
 */
export const lookupOrCreatePatientUser = async (uid, phoneE164) => {
  const digits = phoneE164.replace('+91', '').replace(/\s/g, '');

  const regSnap = await getDoc(doc(db, 'patient_registrations', digits));
  if (regSnap.exists()) {
    const reg = regSnap.data();

    // Create / upsert users/{uid} for the patient
    await setDoc(doc(db, 'users', uid), {
      uid,
      phone: phoneE164,
      role: 'patient',
      name: reg.fullName,
      email: reg.email || '',
      caregiverId: reg.caregiverId,
      createdAt: serverTimestamp(),
    }, { merge: true });

    // Link uid back to pre-registration record
    await setDoc(doc(db, 'patient_registrations', digits), { linkedUid: uid }, { merge: true });

    return {
      uid,
      phone: digits,
      name: reg.fullName,
      firstName: reg.firstName,
      middleName: reg.middleName || '',
      lastName: reg.lastName,
      age: reg.age,
      email: reg.email || '',
      caregiverId: reg.caregiverId,
      patientDocId: reg.patientDocId,
      role: 'patient',
    };
  }

  // ── Fallback 1: check the patients collection directly by phone ──────────────────────────────
  // This handles patients registered BEFORE patient_registrations collection was added.
  const patientDocId = `patient_${digits}`;
  const patientSnap = await getDoc(doc(db, 'patients', patientDocId));

  if (patientSnap.exists()) {
    const p = patientSnap.data();

    // Upsert users/{uid} now that we have their uid
    await setDoc(doc(db, 'users', uid), {
      uid,
      phone: phoneE164,
      role: 'patient',
      name: p.fullName || '',
      email: p.email || '',
      caregiverId: p.caregiverId || null,
      createdAt: serverTimestamp(),
    }, { merge: true });

    // Also backfill the patient_registrations record so future logins are faster
    await setDoc(doc(db, 'patient_registrations', digits), {
      phone: phoneE164,
      fullName: p.fullName || '',
      firstName: p.firstName || '',
      middleName: p.middleName || '',
      lastName: p.lastName || '',
      age: p.age || 0,
      email: p.email || '',
      caregiverId: p.caregiverId || null,
      patientDocId,
      linkedUid: uid,
      createdAt: serverTimestamp(),
    }, { merge: true });

    return {
      uid,
      phone: digits,
      name: p.fullName || '',
      firstName: p.firstName || '',
      middleName: p.middleName || '',
      lastName: p.lastName || '',
      age: p.age || '',
      email: p.email || '',
      caregiverId: p.caregiverId || null,
      patientDocId,
      role: 'patient',
    };
  }

  // ── Fallback 2: check if users/{uid} already has a record ─────────────────────────────────
  const existingUserSnap = await getDoc(doc(db, 'users', uid));
  if (existingUserSnap.exists()) {
    const u = existingUserSnap.data();
    return {
      uid,
      phone: digits,
      name: u.name || '',
      email: u.email || '',
      role: 'patient',
    };
  }

  // ── Fallback 3: completely new patient — create minimal record ─────────────────────────────
  await setDoc(doc(db, 'users', uid), {
    uid, phone: phoneE164, role: 'patient', name: '', createdAt: serverTimestamp(),
  }, { merge: true });

  return { uid, phone: digits, name: '', role: 'patient' };
};

