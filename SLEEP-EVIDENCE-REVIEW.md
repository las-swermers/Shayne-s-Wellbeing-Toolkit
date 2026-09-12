# Sleep Lab: evidence review and flexible diary design

Reviewed 12 September 2026 against main `8e3201156761b074d7224fa78222fdf9b8716f05`.

## Product judgment

Keep the sequence **notice → review → try → reflect**, but describe two phases rather than two compulsory calendar weeks. Let students copy dated morning notes from paper, revisit entries through a calendar, and reach an initial review after five distinct baseline dates. Encourage a fuller diary; never reward guessing to fill a streak.

The appropriate positioning is **a student wellbeing experiment informed by sleep education and selected CBT-I principles**. Neither its five-entry threshold nor its rule-based suggestion quiz has been clinically validated. This review is a targeted comparison of the implementation with primary research and authoritative guidance, not a systematic review or clinical endorsement.

## What the evidence supports

| Source | Relevant finding | What it means for this product |
|---|---|---|
| [de Bruin et al., 2015 adolescent randomized trial](https://pmc.ncbi.nlm.nih.gov/articles/PMC4667374/) | 116 adolescents with insomnia were randomized to guided internet CBT-I, group CBT-I, or a waiting list. Six weekly sessions combined several treatment components; improvements were seen after treatment and at follow-up. Assessment used seven consecutive diary nights, with entries requested near waking and restricted retrospective entry. | Supports structured adolescent CBT-I, not an unguided two-week toolkit or this matching algorithm. Late transcription of contemporaneous paper notes must be distinguished from delayed recollection. |
| [Carney et al., 2012 Consensus Sleep Diary](https://pmc.ncbi.nlm.nih.gov/articles/PMC3250369/) | Developed a standardized prospective diary with sleep timing, latency, awakenings, final awakening, rising time and perceived sleep quality. | Supports consistent definitions and near-morning records. Our simplified diary is not the full Consensus Sleep Diary. The calendar is an access aid, not a reason to reconstruct missing nights. |
| [AASM pediatric sleep-duration consensus, 2016](https://aasm.org/resources/pdf/pediatricsleepdurationconsensus.pdf) | Recommends 8–10 hours per 24 hours for ages 13–18. | Protect sleep opportunity. Overnight diary estimates omit naps, so they are not a complete measure of 24-hour sleep. Do not optimize a percentage by cutting time in bed. |
| [AASM adult insomnia guideline, 2021](https://link.springer.com/article/10.5664/jcsm.8986) | Recommends multicomponent CBT-I for adult chronic insomnia and advises against sleep hygiene as the sole treatment. | Adult guidance must not be presented as direct validation in students. A library of healthy habits is useful education, but is not equivalent to insomnia therapy. |
| [NHLBI: insomnia treatment](https://www.nhlbi.nih.gov/health/insomnia/treatment) | Describes CBT-I as a structured treatment using multiple approaches, including cognitive and behavioural components. | Label adapted principles honestly; keep a route to professional support. Do not automate restricted sleep windows, medication choices or treatment prescriptions. |
| [NHLBI: healthy sleep habits](https://www.nhlbi.nih.gov/health/sleep-deprivation/healthy-sleep-habits) | Covers regular routines, time outdoors, a restful bedroom, relaxing before bed and avoiding caffeine near bedtime. | These are reasonable optional habits. General guidance does not validate exact point weights or promise a result for a particular student. |

## Audit of the existing experience

| Area | Finding on main | Resolution in this change |
|---|---|---|
| Review milestone | Five questions and ranking already existed, hidden in a drawer below the form. | A baseline review dialog opens once when saving reaches the threshold. A persistent stage button reopens it. Students can dismiss it and keep logging. |
| Flexible timing | Rolling rounds already allowed gaps; much of the language still claimed “week one/week two.” | Phase language across the working log, review, results and personal report. Five entries over fourteen days are supported. |
| Paper entry | Date input and history editing existed, but a first late-dated entry prevented entering earlier baseline notes. | Calendar opens saved dates for editing or blank dates for entry. The first self-paced round can extend backwards. Fixed school dates and historical phase ownership are preserved. |
| Entry reliability | No distinction between a morning note, a later transcription or an older memory. | Source field, creation/update timestamps, source labels in history, coverage in reports and CSV source columns. Old records retain “source not recorded.” |
| Suggestion inputs | Short sleep could trigger caffeine advice; awakenings could imply an environmental cause; bedtime alone could trigger daylight advice; low efficiency implied studying in bed. | Remove those unsupported inferences. Ask the student about relevant habits and constraints. No personality categories. |
| Wake-time statistic | Standard deviation was described as if it were a night-to-night swing. Midnight values could create a false large spread. | Label SD accurately and unwrap clock times around the first observation. |
| Results | Red/green differences implied success/failure; sparse entries were called weeks. | Neutral differences, phase labels, date spans and entry-source counts. State that the comparison cannot establish cause. |
| Historical plans | The committed start was preserved, but recommendation context was not recorded. | Save a versioned review snapshot with dates, signal summary, answers and choices. Later edits do not rewrite the original choice context. |

## Student journey

1. **Notice.** Aim to record near waking for 7–14 days, including school and free days. This is a product recommendation for a more representative picture, not a validated requirement. Existing helpful routines and care continue.
2. **Use the calendar when needed.** Select the morning of waking. A recorded date loads its actual values. A paper diary can be transcribed later in any order. Missing nights stay missing.
3. **Identify the source.** Choose recent check-in, diary written that morning, or remembering an older night. A new old entry cannot be marked as a recent check-in. Source labels are self-reports, not independently verified evidence.
4. **Review after five dates.** See counts and date coverage, a short diary summary and tentative suggestions. The threshold is an engagement decision. Students can continue recording before choosing anything.
5. **Refine the fit.** Five questions ask about wakefulness, phone access, caffeine timing, studying in bed and daylight. Include “usually okay / not sure” and “no other place to work.” The latter removes advice requiring another workspace.
6. **Choose a manageable step.** Suggest starting with one habit; retain the existing maximum of three. Each option states its reason, practical action and evidence category. The quiz is optional, unscored and not a diagnostic instrument.
7. **Start prospectively.** For rolling rounds, the first changes-night ends on the morning after committing the plan, or after any later existing entry. A late-imported earlier note remains baseline. This version does not retrospectively assign a plan students started on paper before using the site.
8. **Reflect.** Comparison becomes available after five changes-phase entries. Continue observing if useful. A short before/after record can support discussion, not establish treatment efficacy.

Older memories remain in the personal record and descriptive results, with counts disclosed. They are excluded from the diary signals used for suggestions. At least five non-recalled entries are required for signal-based suggestions; otherwise the interface offers general options and the routine check. Historical entries whose source was never recorded remain eligible with an explicit unknown-source count. No missing values are invented.

## Strategy-by-strategy assessment

These are product judgments about the wording and matching rules, not independent clinical efficacy ratings.

| Current option | Evidence category used in the UI | Suitable matching basis / limitation |
|---|---|---|
| Make time for daylight | General sleep guidance | Reported lack of outdoor/daylight opportunity. A late bedtime alone does not establish a circadian disorder or justify light treatment. |
| Keep a steady sleep schedule | General sleep guidance | Recorded timing variability or a discussion about insufficient sleep opportunity. Must preserve enough sleep, rather than demand an earlier alarm. |
| Keep weekends consistent | General sleep guidance | Available in the resources library. Do not rank a duplicate schedule habit solely from the same variability statistic. |
| Reset when bed feels frustrating | Adapted CBT-I principle | A possible option when falling asleep takes a while and lying awake is frustrating. Retain no-clock-watching wording and safe-space guidance. |
| Give studying its own space | Adapted CBT-I principle | Student reports working/scrolling in bed and has another usable place. A low efficiency estimate does not identify this habit. |
| Give screens a bedtime | General sleep guidance | Student reports devices in bed or within reach. Phone location does not prove it caused poor sleep. |
| Skip afternoon caffeine | General sleep guidance | Student reports afternoon/evening caffeine. Remove the deterministic “half remains” claim. |
| Make room to wind down | General sleep guidance | Student reports feeling wired, or chooses it as a feasible routine. No promise of faster sleep. |
| Write down tomorrow | Optional wind-down idea | Student identifies a busy mind and wants to try writing. General CBT-I/relaxation guidance does not establish this exact writing exercise's efficacy. |
| Make your room restful | General sleep guidance | Student reports light, heat, noise or shared-room difficulty. Night-waking count alone cannot establish the cause. |

## Remaining improvements, in priority order

1. **Improve measurement before claiming research-grade results.** Add optional school/free-day classification, perceived sleep quality, final awakening versus rising time, naps and contextual disruptions. The existing “minutes awake” combines night wakefulness and final wakefulness, so it cannot report standard WASO separately. Wake-up count is capped at “three or more”; its mean is approximate. Legacy records use an older calculation and must remain labelled. Avoid turning a short log into a burden: use optional details and usability testing.
2. **Finish the paper language pass.** The existing downloadable PDF remains a two-block, seven-row sheet. It can supply dated entries to the calendar, but its fixed “week” wording and the landing-page fourteen-night explanation need a coordinated follow-up. Update PDF, preview image, generator and introductory copy together; do not silently alter a previously downloaded form.
3. **Give comparison more context.** Add a diary-only comparison beside the all-entry summary, school/free-day counts and whether the student actually tried the chosen habit. Show morning energy consistently; it is not an all-day functioning measure. Adherence now uses only changes-phase nights with a plan, so baseline nights do not lower it.
4. **Add a brief reflection.** Ask what was feasible, what felt useful and what got in the way. If a plan changes mid-phase, record the change rather than retrospectively attributing all nights to the new plan. Let students continue or seek support without a failure label.
5. **Review suitability with an adolescent sleep clinician before a supported pilot.** The existing support page should be checked for a clear route when difficulties persist or interfere with daytime life, or when sleep symptoms need assessment. Help must remain accessible before a diary threshold. Do not introduce automated diagnosis, sleep restriction, supplement dosing or timed light treatment.
6. **Connect identity and storage.** Preserve source, timestamps, phase boundaries and review version in the future authenticated API. Use account IDs for ownership, not client-submitted email. IDs are pseudonymous, not automatically anonymous. Group reporting must suppress small groups and account for entry quality and unequal participation. The legacy endpoint remains blank; this PR does not connect Google Sheets or activate sign-in.

## Acceptance and limits

Automated checks exercise sparse dates, earlier paper entries, editing without duplication, source validation, one-time prompts, dismissal/resume, plan snapshots, preserved phase boundaries, future-date blocking, source persistence and recommendation rules. Existing migration, result-isolation and record journeys remain required.

Browser visual and keyboard verification should cover 360px and 1440px in both themes: no horizontal overflow, readable calendar dates, native dialog Escape/focus behaviour and access to the commit button. Responsive code alone is not visual acceptance. Clinical validation and a real-account sync test are separate work.

Validation for this PR: 22 automated tests and three DOM journeys passed. Native browser rendering was unavailable: Playwright is installed but its Chromium executable is absent. No screenshots, native keyboard pass or mobile visual acceptance are claimed. Review the Vercel PR preview in both themes before merging.
