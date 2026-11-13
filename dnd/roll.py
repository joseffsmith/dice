#!/usr/bin/env python3
"""Dice roller for our D&D sessions.

Uses the OS cryptographic RNG (secrets.SystemRandom), so neither of us can
fudge a result. Every roll is appended to rolls.log with a timestamp and a
reason, so there's an audit trail.

Usage:
  python3 roll.py d20+5 "Perception check"
  python3 roll.py 2d6+3 "Greatsword damage"
  python3 roll.py adv d20+4 "Stealth, advantage"
  python3 roll.py dis d20+2 "Attack, disadvantage"
  python3 roll.py 4d6kh3 "Ability score"       # keep highest 3
  python3 roll.py 1d8+1d6+2 "Sneak attack"
  python3 roll.py --secret d20+3 "Hidden DM roll"   # logged, but not printed
"""
import re
import secrets
import sys
from datetime import datetime
from pathlib import Path

RNG = secrets.SystemRandom()
LOG = Path(__file__).with_name("rolls.log")
TERM = re.compile(r"([+-])?\s*(?:(\d*)d(\d+)(?:k([hl])(\d+))?|(\d+))", re.I)


def roll_expr(expr: str):
    expr = expr.replace(" ", "")
    pos, total, parts = 0, 0, []
    while pos < len(expr):
        m = TERM.match(expr, pos)
        if not m or m.end() == pos:
            raise ValueError(f"Can't parse dice expression near: {expr[pos:]!r}")
        sign = -1 if m.group(1) == "-" else 1
        if m.group(3):
            n, sides = int(m.group(2) or 1), int(m.group(3))
            if not (1 <= n <= 100 and 2 <= sides <= 1000):
                raise ValueError("Unreasonable dice")
            rolls = [RNG.randint(1, sides) for _ in range(n)]
            kept = rolls
            if m.group(4):
                k = int(m.group(5))
                kept = sorted(rolls, reverse=(m.group(4).lower() == "h"))[:k]
            sub = sum(kept)
            label = f"{n}d{sides}{'k' + m.group(4) + m.group(5) if m.group(4) else ''}"
            shown = f"{label}{rolls}" + (f"->kept{kept}" if kept is not rolls else "")
            parts.append(("-" if sign < 0 else "+") + shown)
        else:
            sub = int(m.group(6))
            parts.append(("-" if sign < 0 else "+") + str(sub))
        total += sign * sub
        pos = m.end()
    return total, " ".join(parts).lstrip("+")


def main(argv):
    if not argv:
        print(__doc__)
        return 1
    secret = False
    if argv[0] == "--secret":
        secret, argv = True, argv[1:]
    mode = None
    if argv[0].lower() in ("adv", "dis"):
        mode, argv = argv[0].lower(), argv[1:]
    expr, reason = argv[0], " ".join(argv[1:]) or "-"

    if mode:
        (t1, d1), (t2, d2) = roll_expr(expr), roll_expr(expr)
        pick = max(t1, t2) if mode == "adv" else min(t1, t2)
        detail = f"{mode.upper()}: [{d1} = {t1}] vs [{d2} = {t2}] -> {pick}"
        total = pick
    else:
        total, d = roll_expr(expr)
        detail = f"{d} = {total}"

    nat = ""
    d20s = [int(x) for x in re.findall(r"\b1d20\[(\d+)\]", detail)]
    if d20s and len(d20s) == (2 if mode else 1):
        kept = max(d20s) if mode == "adv" else min(d20s) if mode == "dis" else d20s[0]
        nat = "  ** NATURAL 20! **" if kept == 20 else "  ** natural 1 **" if kept == 1 else ""

    line = f"[{datetime.now():%Y-%m-%d %H:%M:%S}] {'(SECRET) ' if secret else ''}{reason}: {expr} -> {detail}{nat}"
    print("Secret roll logged." if secret else line)
    with LOG.open("a") as f:
        f.write(line + "\n")
    return 0


if __name__ == "__main__":
    sys.exit(main(sys.argv[1:]))
