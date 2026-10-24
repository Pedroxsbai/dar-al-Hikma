import type { Scholar, NewScholar, Work } from "./types";
import { Log, MeasureTime, ValidateWorkImpact } from "./decorators";

export class Repository<T extends { id: number }> {
  private items: T[] = [];

  @Log
  add(item: T): void {
    this.items.push(item);
  }

  // Exercise 1: the repository assigns the identifier.
  protected create(data: Omit<T, "id">): T {
    const nextId = Math.max(0, ...this.items.map(item => item.id)) + 1;
    const item = { ...data, id: nextId } as unknown as T;
    this.items.push(item);
    return item;
  }

  @MeasureTime
  findById(id: number): T | undefined {
    return this.items.find(item => item.id === id);
  }

  getAll(): T[] {
    return [...this.items];
  }

  update(id: number, changes: Partial<T>): boolean {
    const item = this.findById(id);

    if (!item) return false;

    Object.assign(item, changes);
    return true;
  }
}

export class ScholarRepository extends Repository<Scholar> {
  // Exercise 1: register a scholar without providing an id.
  addScholar(newScholar: NewScholar): Scholar {
    return this.create(newScholar);
  }

  // Exercise 2: indexed access type = the Field union.
  findByField(field: Scholar["field"]): Scholar[] {
    return this.getAll().filter(scholar => scholar.field === field);
  }
}

export class WorkRepository extends Repository<Work> {
  // Exercise 4: refuse works with a negative impact.
  @ValidateWorkImpact
  override add(work: Work): void {
    super.add(work);
  }
}
