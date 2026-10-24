import {
  type Scholar,
  type Work,
  type AcademyEvent,
  type Field,
  type FieldPoints,
  type WorkCategory,
  type WorkPublishedEvent,
  type WorkOutput,
  type ArrayElement,
  type ScholarSummary,
  type ScholarUpdate,
  type NewScholar,
  type TheoryWork,
  type NonApplicationCategory,
} from "./types";

import { ScholarRepository, WorkRepository } from "./repository";
import { Log, Cache } from "./decorators";

// Exercise 6: the only accepted fields.
const validFields: readonly Field[] = [
  "Mathematics",
  "Medicine",
  "Astronomy",
  "Chemistry"
];

function isField(value: unknown): value is Field {
  return (
    typeof value === "string" &&
    validFields.some(field => field === value)
  );
}

// Type guard: safely narrow unknown data to a Scholar.
function isScholar(value: unknown): value is Scholar {
  if (typeof value !== "object" || value === null) {
    return false;
  }

  const candidate = value as Record<string, unknown>;

  return (
    typeof candidate.id === "number" &&
    typeof candidate.name === "string" &&
    isField(candidate.field) &&
    typeof candidate.level === "number" &&
    typeof candidate.active === "boolean"
  );
}

class AcademyService {
  constructor(
    private readonly scholars: ScholarRepository,
    private readonly works: WorkRepository
  ) {}

  @Log
  publishWork(scholarId: number, workId: number): string {
    const scholar = this.scholars.findById(scholarId);
    const work = this.works.findById(workId);

    if (!scholar || !work) {
      throw new Error("Scholar or work not found");
    }

    return `${scholar.name} publishes ${work.name}!`;
  }

  findByField(field: Field): ScholarSummary[] {
    return this.scholars
      .findByField(field)
      .map(({ id, name, field }) => ({ id, name, field }));
  }

  updateScholar(id: number, changes: ScholarUpdate): boolean {
    return this.scholars.update(id, changes);
  }

  getPublishedEvents(events: AcademyEvent[]): WorkPublishedEvent[] {
    return events.filter(
      (event): event is WorkPublishedEvent => event.type === "work-published"
    );
  }
}

// Exercise 3: this handler only accepts "work-published" events.
function handleWorkPublished(event: WorkPublishedEvent): void {
  console.log(`Scholar ${event.scholarId} published ${event.workName}`);
}

// Exercise 5: cached method.
class ImpactCalculator {
  @Cache
  calculateImpact(baseImpact: number, multiplier: number): number {
    console.log("Calculating...");
    return baseImpact * multiplier;
  }
}

const scholars = new ScholarRepository();
const works = new WorkRepository();

scholars.add({
  id: 1,
  name: "Al-Khwarizmi",
  field: "Mathematics",
  level: 9,
  active: true,
  city: "Baghdad"
});

scholars.add({
  id: 2,
  name: "Ibn Sina",
  field: "Medicine",
  level: 10,
  active: true
});

scholars.add({
  id: 3,
  name: "Al-Battani",
  field: "Astronomy",
  level: 8,
  active: true
});

works.add({
  id: 101,
  name: "Al-Jabr",
  category: "theory",
  impact: 95
});

works.add({
  id: 102,
  name: "The Canon of Medicine",
  category: "application",
  impact: 98
});

const academy = new AcademyService(scholars, works);

console.log("\n--- Publish a work ---");
console.log(academy.publishWork(1, 101));

console.log("\n--- Exercise 1: add a new scholar (id assigned) ---");
const newScholar: NewScholar = {
  name: "Jabir ibn Hayyan",
  field: "Chemistry",
  level: 9,
  active: true
};
const jabir = scholars.addScholar(newScholar);
console.log(jabir);

console.log("\n--- Exercise 2: find scholars by field ---");
console.log(academy.findByField("Medicine"));
console.log(scholars.findByField("Chemistry"));

console.log("\n--- Update a scholar ---");
academy.updateScholar(1, { level: 10 });
console.log(scholars.findById(1));

console.log("\n--- Exercise 3: work-published events ---");
handleWorkPublished({
  type: "work-published",
  scholarId: 3,
  workName: "Zij al-Sabi"
});
const events: AcademyEvent[] = [
  { type: "work-published", scholarId: 3, workName: "Zij al-Sabi" },
  { type: "level-up", scholarId: 2, newLevel: 11 },
  { type: "scholar-expelled", scholarId: 4 }
];
console.log(academy.getPublishedEvents(events));

console.log("\n--- Exercise 4: validate work impact ---");
works.add({
  id: 103,
  name: "Zij al-Sabi",
  category: "experiment",
  impact: 85
});
try {
  works.add({
    id: 104,
    name: "Unverified Claim",
    category: "theory",
    impact: -10
  });
} catch (error: unknown) {
  console.log(
    "Rejected:",
    error instanceof Error ? error.message : error
  );
}

console.log("\n--- Exercise 5: cache decorator ---");
const calculator = new ImpactCalculator();
console.log(calculator.calculateImpact(10, 3));
console.log(calculator.calculateImpact(10, 3));
console.log(calculator.calculateImpact(5, 2));

console.log("\n--- Exercise 6: strict type guard ---");
const validData: unknown = {
  id: 1,
  name: "Al-Khwarizmi",
  field: "Mathematics",
  level: 9,
  active: true
};
const invalidData: unknown = {
  id: 2,
  name: "Unknown",
  field: "Astrology",
  level: 5,
  active: true
};
console.log(isScholar(validData)); // true
console.log(isScholar(invalidData)); // false

const unknownScholar: unknown = scholars.findById(1);
if (isScholar(unknownScholar)) {
  console.log(`${unknownScholar.name} works in ${unknownScholar.field}`);
}

console.log("\n--- Record utility type ---");
const points: FieldPoints = {
  Mathematics: 100,
  Medicine: 95,
  Astronomy: 90,
  Chemistry: 85
};
console.log(points);

// Compile-time demonstrations: these aliases are checked by TypeScript.
type PublishArguments = Parameters<AcademyService["publishWork"]>;
type PublishResult = ReturnType<AcademyService["publishWork"]>;
type TheoryOutput = WorkOutput<"theory">; // number
type ApplicationOutput = WorkOutput<"application">; // string
type WorkItem = ArrayElement<Work[]>; // Work
type TheoryWorkExample = TheoryWork;
type RemainingCategories = NonApplicationCategory;
type CategoryExample = WorkCategory;

const typeExamples: [
  PublishArguments,
  PublishResult,
  TheoryOutput,
  ApplicationOutput,
  WorkItem,
  TheoryWorkExample["category"],
  RemainingCategories,
  CategoryExample
] | null = null;

void typeExamples;
