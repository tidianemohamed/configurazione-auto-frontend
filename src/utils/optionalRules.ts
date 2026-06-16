import type { Optional, BackendIncompatibility, BackendRequirement } from '../types';

function getIncompatibilityPair(inc: BackendIncompatibility): [number, number] | null {
  if (inc.optional_a_id != null && inc.optional_b_id != null) {
    return [inc.optional_a_id, inc.optional_b_id];
  }
  if (inc.optional_id != null && inc.incompatible_with_id != null) {
    return [inc.optional_id, inc.incompatible_with_id];
  }
  return null;
}

function getRequiredId(req: BackendRequirement): number | null {
  return req.required_optional_id ?? req.requires_id ?? null;
}

export function mapOptionalsWithRules(
  rawOptionals: Optional[],
  incompatibilities: BackendIncompatibility[],
  requirements: BackendRequirement[],
): Optional[] {
  return rawOptionals.map((opt) => {
    const incompatibleWith = new Set<number>();

    incompatibilities.forEach((inc) => {
      const pair = getIncompatibilityPair(inc);
      if (!pair) return;
      const [a, b] = pair;
      if (a === opt.id) incompatibleWith.add(b);
      if (b === opt.id) incompatibleWith.add(a);
    });

    const requires = requirements
      .filter((req) => req.optional_id === opt.id)
      .map(getRequiredId)
      .filter((id): id is number => id != null);

    return {
      ...opt,
      incompatibleWith: Array.from(incompatibleWith),
      requires,
    };
  });
}

export function getOptionalNames(ids: number[], optionals: Optional[]): string {
  return ids
    .map((id) => optionals.find((o) => o.id === id)?.name)
    .filter(Boolean)
    .join(', ');
}

export function areOptionalsIncompatible(a: Optional, b: Optional): boolean {
  return (
    a.incompatibleWith?.includes(b.id) === true
    || b.incompatibleWith?.includes(a.id) === true
  );
}

export function getConflictingSelectedOptionals(
  target: Optional,
  selected: Optional[],
): Optional[] {
  return selected.filter((so) => areOptionalsIncompatible(target, so));
}

export function getMissingRequiredOptionals(
  target: Optional,
  selected: Optional[],
): number[] {
  if (!target.requires?.length) return [];
  return target.requires.filter((reqId) => !selected.some((so) => so.id === reqId));
}
