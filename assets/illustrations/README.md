# Pastel education illustrations

Original AI-generated softly stylized colored-pencil caricatures created for Philosophy AI Education.

- `learning-together.webp`: three adult educators studying a book and laptop together; hero image.
- `tools-01.webp` through `tools-05.webp`: five 3×3 atlases, each containing eight unique tool illustrations. The ninth stationery cell is unused. All 40 AI tools have a distinct scene.
- `tools-06.webp`: classroom management and daily challenge verification scenes, mapped to `philoclassapp.netlify.app` and `philochallenge.netlify.app` (scenes 40–41). This sheet uses 37.5% square viewports at x=0% and x=60% to preserve the generated scenes' margins.
- `tool-subjects.webp`: the previous 4×4 category atlas, retained only for user-created showcase projects.

Atlas order (left to right, top to bottom): reading, mathematics/physics, life science/chemistry, geology, ecology, discussion, Joseon history, careers, coding/AI, board games, media, workplace learning, business analysis, driving, football, astronomy.

`TOOL_ARTWORK` in `index.html` maps each tool's hostname to a unique scene. `getToolArtwork()` uses the URL first, with an exact known-name fallback for CMS entries. Category filtering and reordering do not change a tool's image. Unknown CMS tools show their own name until dedicated artwork is added; no existing tool image is reused. Illustrations are decorative and hidden from assistive technology because the adjacent card title describes the tool. The hero has descriptive Korean alternative text.

The atlas scenes follow `DEFAULT_TOOLS` order in consecutive groups of eight:

| Sheet | Tools, in reading order |
| --- | --- |
| 01 | English dictionary; reading coach; sentence tree; calculus; Newton mechanics; physics sandbox; pendulum simulation; physics teacher workshop |
| 02 | AlphaFold protein ribbons; anatomy layers; element card battle; Earth interior; food chain; research notes; critical thinking; debate |
| 03 | Danjong; career coach; probability prompts; Go/Janggi/chess; original-book reading; video analysis; interview; policy chatbot |
| 04 | Corporate learning; independence activist archive; 3D physics playground; university staff training; national commercial analysis; parking; racing; 3D physics laboratory |
| 05 | Football; subscription fees; reverse code learning; English speaking; vocabulary repetition; telescope/constellations (Opus); solar-system orrery (Sol); neighborhood commercial analysis (JEV) |

WebP assets preserve the generated composition and are compressed for delivery. Original PNG generation outputs remain outside the website checkout in `/workspace/generated_images`.

Art direction: gently enlarged round heads, small almond-shaped eyes with softly drawn eyelids and brown irises, simplified noses, modest smiles, and adult educator characters. Preserve broken pencil contours, sparse pastel hatching, and uncolored paper margins. Balance cute caricature styling with a natural handmade finish; avoid lifelike portrait rendering and glossy mascot styling.
