"""
Sorting Algorithms for Railway Maintenance Scheduling
=====================================================
Implements Merge Sort O(N log N) for deterministic, stable sorting of maintenance tasks.
"""

from typing import List, Callable, Any, TypeVar

T = TypeVar("T")


def merge_sort(items: List[T], key_fn: Callable[[T], Any]) -> List[T]:
    """
    Standard Divide-and-Conquer Merge Sort implementation:
    1. Divide the array into two halves: O(1).
    2. Recursively sort each half: 2 * T(N/2).
    3. Merge the two sorted halves: O(N).
    Total Time Complexity: O(N log N)
    Auxiliary Space: O(N)
    Stability: Stable (preserves relative order of equal keys)
    """
    if len(items) <= 1:
        return list(items)

    mid = len(items) // 2
    left = merge_sort(items[:mid], key_fn)
    right = merge_sort(items[mid:], key_fn)

    merged = []
    i = 0
    j = 0

    while i < len(left) and j < len(right):
        if key_fn(left[i]) <= key_fn(right[j]):
            merged.append(left[i])
            i += 1
        else:
            merged.append(right[j])
            j += 1

    merged.extend(left[i:])
    merged.extend(right[j:])
    return merged
