const fs = require('fs');

let html = fs.readFileSync('stitch_landing.html', 'utf8');

// Extract body inner content
let bodyStart = html.indexOf('<nav'); // start at nav
let bodyEnd = html.indexOf('</body>');
let body = html.substring(bodyStart, bodyEnd).trim();

// Convert attributes
body = body.replace(/class=/g, 'className=');
body = body.replace(/for=/g, 'htmlFor=');

// Fix unclosed tags
body = body.replace(/<img(.*?)>/g, (match) => {
    if (match.endsWith('/>')) return match;
    return match.replace(/>$/, ' />');
});
body = body.replace(/<br>/g, '<br />');

// Convert HTML comments to JSX comments
body = body.replace(/<!--(.*?)-->/gs, '{/* $1 */}');

// Convert style strings to objects
body = body.replace(/style="([^"]*)"/g, (match, p1) => {
    let obj = {};
    p1.split(';').forEach(s => {
        let [k,v] = s.split(':');
        if (k && v) {
            let camelKey = k.trim().replace(/-([a-z])/g, g => g[1].toUpperCase());
            obj[camelKey] = v.trim();
        }
    });
    return `style={${JSON.stringify(obj)}}`;
});

// Update links and buttons
body = body.replace(/href="#"/g, 'href="#" onClick={(e) => { e.preventDefault(); handleAuth(); }}');
body = body.replace(/<button /g, '<button onClick={handleAuth} ');

const jsx = `import React from 'react';
import { useNavigate } from 'react-router-dom';

const Landing = () => {
  const navigate = useNavigate();
  
  const handleAuth = () => navigate('/login');
  
  return (
    <div className="bg-[#0b1326] text-[#dae2fd] font-sans antialiased min-h-screen selection:bg-primary/30">
      ${body}
    </div>
  );
};

export default Landing;
`;

fs.writeFileSync('src/pages/Landing.jsx', jsx);
