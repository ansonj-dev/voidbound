"""
VOIDBOUND RTP planning helper.
This is an illustrative probability model, NOT the final Chain contract math.

Run:
    python scripts/rtp_sim.py
"""
import random
N=1_000_000
total_bet=N
total_win=0.0

# A deliberately simple single-node illustrative model:
# 82% return 1.0x, 14% return 1.35x, 3.5% return 2.0x, 0.5% return 8.0x
# Expected RTP = 0.82 + .14*1.35 + .035*2 + .005*8 = 1.1115 (too high)
# This script is intentionally a warning: the real expedition tree MUST be solved
# before declaring RTP. Replace the distribution with the exact contract state machine.

print("WARNING: replace this illustrative distribution with the exact final paytable.")
print("The Chain Jam submission requires declared theoretical RTP between 93% and 98%.")
