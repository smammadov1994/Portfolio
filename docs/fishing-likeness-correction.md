# Facial likeness correction

Built-in image generation, identity-preserving edit mode. The owner's original photo is the primary identity reference. Earlier illustrations had drifted toward a narrower face and different facial hair. The close-up was rebuilt from the original photograph alone, then used with that photograph to correct the other poses.

Final assets: `dist/assets/seymur-connect-close-v2.png`, `dist/assets/seymur-catch-notice-v2.png`, `dist/assets/seymur-catch-pull-v2.png`, and `dist/assets/seymur-catch-retrieve-v2.png`.

## Close-up prompt

Use case: identity-preserve. Edit THIS photograph of the real person, preserving his face with maximum fidelity. This is a likeness correction, not a new character design. Keep the exact frontal head angle and facial proportions, same eye shape and spacing, eyebrows, nose bridge and tip, upper lip, open smiling mouth and teeth, cheek width, jaw and chin, light even stubble and the actual hair silhouette. No beautification, no longer face, no narrowed cheeks, no pronounced moustache or beard, no deeper smile creases, no model-like reinterpretation. Preserve the friendly slightly surprised open-mouth expression exactly as photographed.
Convert the entire image into a realistic, delicately rendered monochrome graphite drawing. Extend the composition into a landscape 4:3 waist-up portrait with the head centered at about x=49%, eyes y=31%, hair beginning near top. His same dark T-shirt, natural proportions. Add his hand extending toward camera in front of lower torso, holding a blank horizontal cream business card. Hand and body must be drawn consistently, naturally connected, no pasted photographic face. Card rectangle occupies x=35% to71%, y=58% to84%, nearly straight-on, fingers grip left edge and bottom, card face blank for website overlay. Head and torso behind the foreground hand and card. Remove photo background entirely; actual transparent alpha outside person. No scenery, text or watermark. The overriding priority is faithfully translating this man's actual face into graphite, retaining identity over illustration prettiness.

## Pose correction prompt

undefined

The last sentence specifies the respective notice, pull, or retrieve frame. Inputs are the source photograph, the respective existing pose, and the corrected close-up.

