// The four disciplines of the House of Wisdom (equivalent of the four houses).
export type Field =
  | "Mathematics"
  | "Medicine"
  | "Astronomy"
  | "Chemistry";

// A scholar of Dar al-Hikma (equivalent of a Wizard).
export interface Scholar {
  id: number;
  name: string;
  field: Field;
  level: number;
  active: boolean;

  // Index signature: dynamic properties must use these value types.
  [key: string]: string | number | boolean;
}

export type WorkCategory = "theory" | "experiment" | "application";

// A scientific work (equivalent of a Spell).
export interface Work {
  id: number;
  name: string;
  category: WorkCategory;
  impact: number;
}

export type AcademyEvent =
  | { type: "work-published"; scholarId: number; workName: string }
  | { type: "level-up"; scholarId: number; newLevel: number }
  | { type: "scholar-expelled"; scholarId: number };

// Exercise 3: only the "work-published" member of the union.
export type WorkPublishedEvent = Extract<AcademyEvent, { type: "work-published" }>;

// Conditional type: choose an output type based on the work category.
export type WorkOutput<T extends WorkCategory> =
  T extends "theory" ? number :
  T extends "experiment" ? boolean :
  T extends "application" ? string :
  never;

// infer extracts an array element type.
export type ArrayElement<T> =
  T extends (infer Item)[] ? Item : never;

// Utility type examples.
// Exercise 1: the caller provides everything except the id.
// Omit<Scholar, "id"> alone would lose every named property because Scholar has
// an index signature, so we first keep only its known keys.
type KnownKeys<T> = {
  [K in keyof T as string extends K ? never : number extends K ? never : K]: T[K];
};
export type NewScholar = Omit<KnownKeys<Scholar>, "id"> &
  Record<string, string | number | boolean>;

export type ScholarSummary = Pick<Scholar, "id" | "name" | "field">;
export type ScholarUpdate = Partial<Scholar>;

export type TheoryWork = Extract<Work, { category: "theory" }>;
export type NonApplicationCategory = Exclude<WorkCategory, "application">;
export type FieldPoints = Record<Field, number>;
