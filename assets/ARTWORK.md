# Artwork used in the toolkit

## Current tool illustrations and entrance — September 12, 2026

The active toolkit cards use transparent editorial illustrations: a sleeping
sheep, bunk bed, backpack and open notebook. They share the alpine scene's
cream, sage, teal and ochre palette, with simplified contours and paper texture.
The entrance uses cow-jump-v2.webp on a scene-relative arc over a separate moon,
with the existing cream cloud layers behind it and a final cloud wipe.
The older SVG landscape-card icons and cow-line.svg are retained as history.
See [ILLUSTRATION-PROMPTS.md](ILLUSTRATION-PROMPTS.md) for paths and prompts.

The wellbeing ribbon uses small code-native line symbols with concept labels;
these support the editorial card illustrations without repeating full scenes.

## Previous geometric illustration pass — September 12, 2026

The current landing page uses alpine-line-day.webp and alpine-line-night.webp,
paired 1774 × 887 illustrations generated from the user's alpine composition and
minimal mountain/cloud references. Day uses pale aqua, sage and cream with a sun;
night uses inky teal and a crescent. WebP delivery encodings use quality 93.
The previous textured artwork is retained as source history, not the active hero.

Day prompt brief: reinterpret the existing alpine lake, mountain ridges, pines
and right-hand village as clean geometric silhouettes and restrained outlines.
Preserve the composition, keep the upper sky spacious for typography, use a small
sun, flat cream snow and teal/sage terrain. No text, logos or interface elements.

Night edit brief: preserve the daytime composition, positions, outlines and
landscape features; change only to an inky teal moonlit palette, replace the sun
with a crescent, and add a few subtle stars. No extra typography or UI.

cloud-line-day.svg and cloud-line-night.svg are original code-native scalloped
cloud layers with matching geometry and fine contour lines. cow-line.svg is an
original outlined leaping cow used in the Sleep Lab entrance. The sheep icon is
now a small illustrated alpine scene alongside the other tool scenes, rather
than a sculptural bitmap. icon-sleep.svg, icon-roommate.svg,
icon-first-weeks.svg and icon-exam.svg use the same flat mountain, lake,
cream-snow and contour vocabulary at the toolkit-card scale.
These vectors are intentionally editable and do not use a third-party icon pack.

The Sleep Lab entrance uses the cream cloud layer as a readable backdrop, with
the moon above the clouds and the outlined cow above the moon. The cloud layers
sit behind the animated subjects so the jump remains legible on small screens.

The artwork and updated one-page PDF were inspected. Automated interaction checks
are not a substitute for rendered mobile/desktop and motion acceptance.

## Earlier textured pass (retained source history)

## Delivery optimization

The refinement serves WebP encodings of the existing artwork at quality 88:
alpine-night-clean (94,318 bytes), cow-leap (172,190), moonlit-clouds (310,352)
and sleep-sheep (93,636). Combined: 670,496 bytes instead of 5,492,059 for
the same four PNG originals. PNG masters remain for future art work but are not
requested by the landing page. The unused 2.4 MB alpine-night.png preload is gone.
This is file-size evidence, not a measured Lighthouse or mobile timing score.

Generated with built-in imagegen on September 10, 2026. Existing alpine-night.png
is retained from the original vision. These are original assets, not assets
downloaded from the reference template.

## sleep-sheep.png
Transparent RGBA, 1254 × 1254. Used in the Sleep Lab tool dock.

Prompt: Use case: stylized-concept. Asset type: premium 3D sheep icon for a 64px
website tool dock. Generate one square 1024x1024 PNG with a genuinely transparent
background and preserved alpha. A single small sheep, ivory matte sculpted wool
and charcoal face and legs, clean readable silhouette, three-quarter side view.
Subtle cool moonlight highlights. Centered with generous padding. Polished
sculptural 3D render. No text, logo, background, ground, shadow plane, or platform.

## moonlit-clouds.png
Transparent RGBA, 1536 × 1024. Used as separate foreground/background layers
and for the short transition into Sleep Lab.

Prompt: Use case: stylized-concept. Asset type: independent cloud overlay layer
for a dark alpine website illustration and route transition. Generate one
landscape 1536x1024 PNG with a genuinely transparent background and preserved
alpha. A wide wispy cloud bank of cool silvery indigo moonlit mist. Thin
translucent wisps drift across the lower two-thirds, with transparent top and
edges. Realistic soft atmospheric texture with partial alpha throughout airy
edges so dark scenery remains visible through mist. Only clouds; no moon,
mountains, stars, text, background color, or checkerboard pattern.

## Release status
Assets inspected for composition and transparency. Full PNG originals total
about 7.2 MB with the alpine scene and the clean background. `alpine-night-clean.png`
is an edited copy of the original illustration with only the baked-in cow removed;
`cow-leap.png` is the independent animated layer. Web image optimization and
mobile network timing remain part of the release performance review. The landing
page and scroll choreography have passed static checks; visual/browser QA is still
required.

## cow-leap.png
Transparent RGBA, 1254 × 1254. Animated on a scroll arc over the clean moon scene.

Prompt: Use case: stylized-concept. Asset type: transparent website animation
layer. Generate one square PNG with a genuinely transparent background and
preserved alpha: a small black-and-ivory alpine cow in a graceful mid-jump side
silhouette, legs tucked slightly, tail lifted, readable at 120px wide. Minimal
editorial illustration with a subtle paper-grain edge, calm moonlit palette, no
ground, shadow plane, moon, mountains, clouds, text or logo, centered with generous
transparent padding.
