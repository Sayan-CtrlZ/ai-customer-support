import subprocess

svg_content = """<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 920 1020" width="920" height="1020">
  <defs>
    <!-- Background Dot Grid Pattern -->
    <pattern id="dotGrid" width="24" height="24" patternUnits="userSpaceOnUse">
      <circle cx="3" cy="3" r="1.3" fill="#94a3b8" opacity="0.4"/>
    </pattern>

    <!-- Drop Shadow Filter for Shadcn Cards -->
    <filter id="cardShadow" x="-10%" y="-10%" width="120%" height="130%" filterUnits="userSpaceOnUse">
      <feDropShadow dx="0" dy="1" stdDeviation="2" flood-color="#0f172a" flood-opacity="0.06"/>
      <feDropShadow dx="0" dy="3" stdDeviation="6" flood-color="#0f172a" flood-opacity="0.04"/>
    </filter>

    <!-- Arrowhead Marker -->
    <marker id="arrow" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
      <path d="M 0 1.5 L 8 5 L 0 8.5 z" fill="#64748b" />
    </marker>
  </defs>

  <style>
    .bg { fill: #f8fafc; }
    .card { fill: #ffffff; stroke: #e2e8f0; stroke-width: 1.5; filter: url(#cardShadow); rx: 12px; }
    .card-agent { fill: #eff6ff; stroke: #93c5fd; stroke-width: 1.5; filter: url(#cardShadow); rx: 12px; }
    .db-cyl { fill: #ffffff; stroke: #e2e8f0; stroke-width: 1.5; filter: url(#cardShadow); }
    .text-title { font-family: 'Geist', 'Inter', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; font-size: 15px; font-weight: 500; fill: #0f172a; text-anchor: middle; dominant-baseline: middle; }
    .text-agent { font-family: 'Geist', 'Inter', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; font-size: 15px; font-weight: 500; fill: #1e3a8a; text-anchor: middle; dominant-baseline: middle; }
    .text-label { font-family: 'Geist', 'Inter', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; font-size: 13px; font-weight: 500; fill: #475569; text-anchor: middle; dominant-baseline: middle; }
    .edge { stroke: #64748b; stroke-width: 1.5; fill: none; marker-end: url(#arrow); stroke-linecap: round; stroke-linejoin: round; }
  </style>

  <!-- Background with Dots -->
  <rect width="920" height="1020" class="bg"/>
  <rect width="920" height="1020" fill="url(#dotGrid)"/>

  <!-- ================= EDGES (LINES & ARROWS) ================= -->

  <!-- Gmail inbox -> Poller -->
  <line x1="430" y1="94" x2="430" y2="190" class="edge"/>
  <text x="430" y="142" class="text-label">every 30 to 600 s</text>

  <!-- Poller -> Guards in Python -->
  <line x1="430" y1="250" x2="430" y2="326" class="edge"/>

  <!-- Poller -> Supabase (diagonal) -->
  <path d="M 495 242 L 635 330" class="edge"/>

  <!-- Guards in Python -> Classify with Haiku -->
  <line x1="430" y1="386" x2="430" y2="462" class="edge"/>

  <!-- Classify with Haiku -> Agent with knowledge base tools -->
  <line x1="430" y1="522" x2="430" y2="598" class="edge"/>

  <!-- Agent with knowledge base tools -> Python decides -->
  <line x1="430" y1="682" x2="430" y2="748" class="edge"/>

  <!-- Python decides -> Reply in the thread (left branch) -->
  <path d="M 375 808 L 265 892" class="edge"/>
  <text x="295" y="836" class="text-label">reply</text>

  <!-- Python decides -> Label needs-human (right branch) -->
  <path d="M 485 808 L 595 892" class="edge"/>
  <text x="565" y="836" class="text-label">escalate</text>

  <!-- Dashboard -> FastAPI -->
  <line x1="710" y1="94" x2="710" y2="190" class="edge"/>

  <!-- FastAPI -> Supabase -->
  <line x1="710" y1="250" x2="710" y2="326" class="edge"/>


  <!-- ================= CARDS / NODES ================= -->

  <!-- 1. Gmail inbox -->
  <rect x="335" y="38" width="190" height="56" class="card"/>
  <text x="430" y="66" class="text-title">Gmail inbox</text>

  <!-- 2. Dashboard -->
  <rect x="625" y="38" width="170" height="56" class="card"/>
  <text x="710" y="66" class="text-title">Dashboard</text>

  <!-- 3. Poller -->
  <rect x="350" y="194" width="160" height="56" class="card"/>
  <text x="430" y="222" class="text-title">Poller</text>

  <!-- 4. FastAPI -->
  <rect x="635" y="194" width="150" height="56" class="card"/>
  <text x="710" y="222" class="text-title">FastAPI</text>

  <!-- 5. Supabase (Database Cylinder) -->
  <g transform="translate(650, 330)">
    <!-- Base cylinder shadow/body -->
    <path d="M 0 16 A 60 15 0 0 0 120 16 L 120 52 A 60 15 0 0 1 0 52 Z" class="db-cyl"/>
    <!-- Top ellipse -->
    <ellipse cx="60" cy="16" rx="60" ry="15" class="db-cyl"/>
    <text x="60" y="40" class="text-title">Supabase</text>
  </g>

  <!-- 6. Guards in Python -->
  <rect x="320" y="330" width="220" height="56" class="card"/>
  <text x="430" y="358" class="text-title">Guards in Python</text>

  <!-- 7. Classify with Haiku -->
  <rect x="310" y="466" width="240" height="56" class="card"/>
  <text x="430" y="494" class="text-title">Classify with Haiku</text>

  <!-- 8. Agent with knowledge base tools (Highlighted soft-blue card) -->
  <rect x="255" y="604" width="350" height="78" class="card-agent"/>
  <text x="430" y="632" class="text-agent">Agent with knowledge base</text>
  <text x="430" y="656" class="text-agent">tools</text>

  <!-- 9. Python decides -->
  <rect x="330" y="752" width="200" height="56" class="card"/>
  <text x="430" y="780" class="text-title">Python decides</text>

  <!-- 10. Reply in the thread (Left leaf) -->
  <rect x="145" y="896" width="230" height="56" class="card"/>
  <text x="260" y="924" class="text-title">Reply in the thread</text>

  <!-- 11. Label needs-human (Right leaf) -->
  <rect x="490" y="896" width="230" height="56" class="card"/>
  <text x="605" y="924" class="text-title">Label needs-human</text>

</svg>
"""

with open("docs/images/architecture_shadcn.svg", "w") as f:
    f.write(svg_content)

print("Updated SVG generated.")
