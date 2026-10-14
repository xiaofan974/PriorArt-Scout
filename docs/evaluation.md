# Curated retrieval and grounding evaluation

Dataset `curated-helmet-eval-v1`. Corpus `curated-helmet-v1` (three publications, eight stored passages). Production retriever: exact keyword overlap, minimum two shared terms, at most three passages per feature.

## Label status

The relevance labels, irrelevant-passage labels, expected quotes, missing-detail strings, and rationales were drafted in Cursor from the stored passages and the curated assessment fixture. They have not had an independent human review. A relevant label means a reviewer would want that passage retrieved for the feature. It is not a finding that the feature is disclosed.

## Feature queries

Each query is the feature `sourcePhrase`, tokenized by the production retriever. Tokens shorter than three characters and the retriever stop-word list are removed. There is no stemming.

| Feature | Source phrase | Query terms |
|---|---|---|
| F01 | smart bicycle helmet | smart, bicycle, helmet |
| F02 | detects collisions using accelerometer and gyroscope data | detects, collisions, accelerometer, gyroscope, data |
| F03 | distinguishes genuine accidents from normal movements or accidental drops | distinguishes, genuine, accidents, normal, movements, accidental, drops |
| F04 | automatically sends an emergency notification to a designated contact | automatically, sends, emergency, notification, designated, contact |
| F05 | GPS coordinates transmitted through a connected smartphone | gps, coordinates, transmitted, through, connected, smartphone |
| F06 | cancel the emergency alert within 15 seconds | cancel, emergency, alert, seconds |

## Sixteen relevant feature–passage pairs

Every ID below is one of the eight corpus passages.

| Feature | Relevant passages |
|---|---|
| F01 Wearable protective bicycle helmet | `US10897947B2-C1`, `US10897947B2-C6`, `US10897947B2-D-GPS`, `US11406152B2-C1`, `US11406152B2-D-DROP` |
| F02 Accelerometer and gyroscope sensing | `US8860570B2-C1`, `US8860570B2-C2`, `US10897947B2-C1` |
| F03 Genuine accident versus dropped helmet | `US11406152B2-D-DROP` |
| F04 Emergency notification | `US8860570B2-C1`, `US10897947B2-C1`, `US10897947B2-D-GPS`, `US11406152B2-C1` |
| F05 Smartphone-mediated GPS | `US10897947B2-D-GPS` |
| F06 SOS cancellation versus a 15-second window | `US10897947B2-C6`, `US11406152B2-D-CANCEL` |

Explicitly irrelevant passages are recorded per feature in `src/evaluation/helmetEvalDataset.ts`. Passages omitted from both lists are unlabeled. A retrieved unlabeled passage still counts as a false positive.

## Metric definitions

Retrieval is scored at the passage level with a cap of three hits (Recall@3).

- A true positive is a retrieved passage ID that is in that feature's relevant set.
- A false positive is any other retrieved passage, whether labeled irrelevant or unlabeled.
- Per-feature recall is true positives divided by the size of the relevant set. Every feature in this dataset has at least one relevant passage, so recall is defined. A feature that retrieves nothing has recall 0.
- Per-feature precision is true positives divided by retrieved passages. When a feature retrieves nothing, precision is undefined and is stored as null. It is not treated as zero.
- Micro Recall@3 pools pairs: all true positives divided by all 16 relevant pairs.
- Observed micro precision pools pairs: all true positives divided by all retrieved passages. Features with no hits add nothing to the numerator or the denominator.
- Macro Recall@3 is the unweighted mean of the six per-feature recalls, including the zeros.
- Macro precision is the unweighted mean of per-feature precision among features that retrieved at least one passage. Features with no hits are excluded and counted separately.

## Baseline

Production settings: minimum overlap 2, maximum 3, deterministic ranking by overlap descending and then passage ID.

| Metric | Value |
|---|---|
| Micro Recall@3 | 3/16 (18.75%) |
| Observed micro precision | 3/3 (100%) |
| Macro Recall@3 | 0.1 |
| Macro precision | 1, from F01 only |
| Features with no hits | 5 (F02, F03, F04, F05, F06) |
| False positives | 0 |
| Retrieved irrelevant passages | 0 |

F01 returns `US10897947B2-C1`, `US10897947B2-C6`, and `US10897947B2-D-GPS`. It misses `US11406152B2-C1` and `US11406152B2-D-DROP`. F01 recall is 3/5. The other five features return no passages and have recall 0.

## What is checked, and what is not

These checks are separate. None of them is an end-to-end retrieval score.

- Structural citation check. `validateCuratedAssessment` confirms each fixture citation names an existing feature, publication, and passage, that the passage belongs to that publication, and that the document text equals the corpus text. It also checks that each feature–publication pair has a citation or a research gap, not both. This can pass while retrieval recall stays low.
- Exact quote check. Each expected detail is a substring of the cited stored passage. Each missing-detail string is present verbatim in the fixture's unresolved differences. This does not judge whether the explanation's meaning is fair.
- Semantic grounding. Not scored. The draft rationales and the fixture explanations have not had an independent human review of whether they correctly characterize the passages.
- Fixture agreement. The draft gap publications match the fixture, a labeled-irrelevant passage is not assessed as partial or explicit overlap, and each publication that contains a relevant passage has at least one citation of a relevant passage. Agreement with the fixture is not retrieval quality.

## Failure analysis

The retriever keeps a passage only when at least two query tokens occur as whole tokens. It does not stem words.

F01 is the only feature whose query shares two tokens with the corpus (`smart` and `helmet`). Five passages tie on that score. Ranking then sorts by passage ID, and the cap of three keeps the three `US10897947B2` passages. The two relevant `US11406152B2` passages are dropped because their IDs sort later. `bicycle` does not occur in the corpus.

F02 through F06 share at most one exact token with any stored passage. Plural forms do not match (`gyroscope` / `gyroscopes`, `accelerometer` / `accelerometers`, `collisions` / `collision`). `cancel` does not match `cancellation`, and `accidental` does not match `accidentally`. A single shared token is below the production threshold, so those five features return no passages.

## Limitations

The observed precision of 100% is an estimate on three retrieved passages, all from F01. The five features that return nothing do not lower that figure. Macro precision has the same limitation: it averages the one feature with a defined precision. Macro recall does include those five zeros, which is why it is 0.1 while micro recall is 3/16.

The corpus has eight passages and the labels are a Cursor draft. These figures describe this fixture only.

## Reproducibility

From the repository root:

```bash
npm test
npx eslint . --ext .js,.jsx,.ts,.tsx
npx tsc --noEmit
```

The baseline numbers are asserted in `src/evaluation/helmetEval.test.ts`. The run uses the local corpus and fixture. It does not call EPO or OpenAI.
