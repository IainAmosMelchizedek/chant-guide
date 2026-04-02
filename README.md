# Chant Guide

A contemplative web application that uses the GitHub API to serve sacred Sanskrit 
text data from a public repository, hosted on GitHub Pages.

---

## What This App Does

Chant Guide displays sacred chants from six traditions — Vedic, Ramayana, 
Mahabharata, classical Sanskrit poetry (Kavyam), sacred philosophy (Shastram), 
and Kannada devotional music. Each chant includes the original script, phonetic 
pronunciation with syllable emphasis markers, meaning, source tradition, and 
recommended round count for practice.

The app fetches all chant data live from this GitHub repository using the GitHub 
API, making it a genuine GitHub Developer Program integration.

---

## What We Built

- Live chant selection from six sacred traditions
- Sanskrit, Kannada, and Devanagari script rendering
- Syllable-by-syllable phonetic breakdown with emphasis markers
- Real-time pace control via slider (10–120 syllables/min)
- Self-hosted audio playback with countdown offset timing
- GitHub API integration for live data serving
- Hosted free on GitHub Pages

---

## The Unfinished Mission

The original vision for this application was deeper than what exists here today.

The goal was true syllable-to-voice synchronization — where each syllable 
displayed on screen would highlight in exact alignment with the corresponding 
sound in the audio recording. Not an approximation. Not a fixed timer. True sync, 
so that a practitioner with no lineage, no teacher, and no prior exposure to 
Sanskrit could look at the screen while listening and know — with certainty — 
exactly how each syllable sounds, how long it is held, where the emphasis falls, 
and how it connects to the next.

This matters because Sanskrit is not merely a language. It is a vibrational 
science. The physiological effects of correct Sanskrit pronunciation — proper 
breath engagement, resonance in specific cavities, the activation of particular 
nerve pathways through sound — are documented across traditions and increasingly 
supported by research. Chanting the wrong way is not just aesthetically 
incorrect. It misses the point entirely.

We came close. The onset detection architecture was built. The Web Audio API 
analyser was working. The countdown offset system was functional. What defeated 
us was a combination of CORS restrictions from every major audio hosting platform, 
browser security policies around cross-origin audio analysis, and the broader 
reality that true word-level audio alignment requires pre-built timestamp data 
that does not yet exist in open form for these traditions.

---

## What Would Complete This Vision

For a future developer or a future version of this project:

1. **Forced alignment tooling** — tools like the Montreal Forced Aligner or 
   Aeneas can generate syllable-level timestamps from audio + text. Running these 
   against each chant recording would produce the timestamp data needed for true sync.

2. **Self-hosted audio pipeline** — all audio needs to live in the same origin 
   as the app to avoid CORS. A proper pipeline would process, timestamp-align, 
   and serve audio from the same repository.

3. **Timestamp-driven metronome** — instead of a fixed BPM interval, the 
   metronome advances based on pre-computed timestamps. Each syllable fires at 
   exactly the right millisecond.

4. **Copyright-free traditional recordings** — the gap between what is freely 
   available and what is authentically traditional is real. Future generations 
   may live in a world where ancient sacred texts and their recitations are 
   treated as the shared human heritage they are, rather than as intellectual 
   property.

---

## The Deeper Why

Ancient language used in chant form is one of the oldest technologies humanity 
has for physiological and psychological transformation. Sanskrit, in particular, 
was engineered — not merely evolved — with this purpose in mind. The precision 
of its phonetics is not incidental. It is the entire point.

An application that could teach correct pronunciation to anyone, anywhere, 
regardless of lineage or access to a teacher, would be genuinely valuable. 
That is what this project was reaching toward.

The foundation is here. The architecture is sound. The vision is documented.

---

## Built By

Iain Amos Melchizedek  
Safe Passage Strategies LLC  
GitHub Developer Program Member  

*"Intention + Precision = Consequence"*
