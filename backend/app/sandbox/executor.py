"""
Sandbox — safely execute user-submitted Python code using RestrictedPython.
"""
from RestrictedPython import compile_restricted, safe_globals
from RestrictedPython.Eval import default_guarded_getiter
from RestrictedPython.Guards import guarded_unpack_sequence, safer_getattr
import math


ALLOWED_IMPORTS = {"math": math}


def create_strategy_fn(user_code: str):
    """
    Compile user code and extract the `strategy` function.

    User code must define:
        def strategy(candle, lookback, portfolio):
            # return "BUY", "SELL", or "HOLD"
    """
    try:
        compiled = compile_restricted(user_code, filename="<strategy>", mode="exec")
    except SyntaxError as e:
        raise SyntaxError(f"Compilation error: {e}")

    restricted_globals = safe_globals.copy()
    restricted_globals["__builtins__"] = {
        **safe_globals["__builtins__"],
        "__import__": _restricted_import,
        "abs": abs,
        "max": max,
        "min": min,
        "sum": sum,
        "len": len,
        "range": range,
        "enumerate": enumerate,
        "round": round,
        "sorted": sorted,
        "float": float,
        "int": int,
        "str": str,
        "bool": bool,
        "list": list,
        "dict": dict,
        "tuple": tuple,
    }
    restricted_globals["_getiter_"] = default_guarded_getiter
    restricted_globals["_unpack_sequence_"] = guarded_unpack_sequence
    restricted_globals["_getattr_"] = safer_getattr
    restricted_globals["_getitem_"] = lambda obj, key: obj[key]

    local_ns = {}
    exec(compiled, restricted_globals, local_ns)

    if "strategy" not in local_ns:
        raise ValueError("Code must define a `strategy(candle, lookback, portfolio)` function")

    return local_ns["strategy"]


def _restricted_import(name, *args, **kwargs):
    if name in ALLOWED_IMPORTS:
        return ALLOWED_IMPORTS[name]
    raise ImportError(f"Import of '{name}' is not allowed")
