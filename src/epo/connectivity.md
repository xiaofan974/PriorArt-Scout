# EPO OPS connectivity check

Local check on 14 October 2026. One OAuth client-credentials request and one published-data search. No credentials or access tokens are recorded here.

Query: `ta=helmet AND ta=collision AND (ta=accelerometer OR ta=gyroscope)`

| Step | HTTP status | Response size | Latency |
| --- | --- | --- | --- |
| Token | 200 | 548 bytes | 1,118 ms |
| Search | 200 | 138,718 bytes | 1,831 ms |

OPS reported 9 matches. The handler returned these 9 publication identifiers, each with a title, date, applicant, abstract, and Espacenet link:

- CN121264733A
- US20250380761A1
- CN119679224A
- CN215414347U
- CN214317157U
- CN110403288A
- WO2019053757A1
- CN206302513U
- US2013305437A1

The handler log recorded only phase, status, size, latency, and result count. The Evidence Report stayed locked.
