import { describe, it, expect } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { DataFileApiService } from './data-file-api-service';
import { DATA_FILE_TRANSPORT, DataFileTransport } from './data-file-transport';
import type { EncounterEntry, SpecEntry } from '../encounter/encounter.models';
import { SpecMeta } from './spec-meta.models';
import { NorthernSkyPhases } from '../northern-sky/northern-sky-phases';
import { Result, Results } from '../../../shared/util-http/result';

// These tests pin the exact relative paths the service owns: a drift silently 404s every runtime read or writes ingested data to the wrong place.
const SPEC = 'SubtletyRogue';
const ENCOUNTER_ID = 3176;
const BENCH = 'burst';

// Records every transport call so a test can assert the exact relative path used.
class RecordingTransport implements DataFileTransport {
  readonly reads: string[] = [];
  readonly writes: [string, unknown][] = [];
  readonly removes: string[] = [];
  readonly lists: string[] = [];

  constructor(
    private readonly readResult: Result<unknown> = Results.ok(null),
    private readonly listValue: string[] = [],
  ) {}

  readJson<T>(relPath: string): Promise<Result<T>> {
    this.reads.push(relPath);
    return Promise.resolve(this.readResult as Result<T>);
  }

  writeJson(relPath: string, data: unknown): Promise<void> {
    this.writes.push([relPath, data]);
    return Promise.resolve();
  }

  remove(relPath: string): Promise<void> {
    this.removes.push(relPath);
    return Promise.resolve();
  }

  list(relDir: string): Promise<string[]> {
    this.lists.push(relDir);
    return Promise.resolve(this.listValue);
  }
}

function withTransport(transport: DataFileTransport): DataFileApiService {
  // Reset so a test can build the service twice (e.g. present vs missing file) in one case.
  TestBed.resetTestingModule();
  TestBed.configureTestingModule({
    providers: [
      DataFileApiService,
      { provide: DATA_FILE_TRANSPORT, useValue: transport },
    ],
  });
  return TestBed.inject(DataFileApiService);
}

describe('DataFileApiService reads', () => {
  it('reads a tailored bench file at {spec}/{bench}/{enc}.json, passing the transport Result through', async () => {
    const bench = { encounter_id: ENCOUNTER_ID };
    const transport = new RecordingTransport(Results.ok(bench));

    const result = await withTransport(transport).getBench(SPEC, ENCOUNTER_ID, BENCH);

    expect(result).toEqual(Results.ok(bench));
    expect(transport.reads).toEqual(['SubtletyRogue/burst/3176.json']);
  });

  it('propagates a transient bench read failure unchanged', async () => {
    const transport = new RecordingTransport(Results.transient('WCL is unreachable right now.'));
    expect(await withTransport(transport).getBench(SPEC, ENCOUNTER_ID, BENCH))
      .toEqual(Results.transient('WCL is unreachable right now.'));
  });

  it('reads the ingest state at {spec}/ingest-state.json', async () => {
    const transport = new RecordingTransport(Results.ok({ empty_encounter_ids: [] }));
    await withTransport(transport).getIngestState(SPEC);
    expect(transport.reads).toEqual(['SubtletyRogue/ingest-state.json']);
  });

  it('reads a rulebook at {spec}/rulebook.json', async () => {
    const transport = new RecordingTransport(Results.ok({ spec: SPEC }));
    await withTransport(transport).getRulebook(SPEC);
    expect(transport.reads).toEqual(['SubtletyRogue/rulebook.json']);
  });

  it('reads the spec manifest at index.json, folding a missing file to Results.ok([]) but propagating a transient error', async () => {
    const specs: SpecEntry[] = [{ spec: SPEC, encounter_count: 2 }];
    const present = new RecordingTransport(Results.ok(specs));
    expect(await withTransport(present).getSpecs()).toEqual(Results.ok(specs));
    expect(present.reads).toEqual(['index.json']);

    const missingManifest = new RecordingTransport(Results.missing('Not yet ingested.'));
    expect(await withTransport(missingManifest).getSpecs()).toEqual(Results.ok([]));

    const outage = new RecordingTransport(Results.transient('WCL is unreachable right now.'));
    expect(await withTransport(outage).getSpecs()).toEqual(Results.transient('WCL is unreachable right now.'));
  });

  it('reads a spec encounter index at {spec}/encounters.json, folding a missing file to Results.ok([])', async () => {
    const encounters: EncounterEntry[] = [{ id: ENCOUNTER_ID, name: 'Boss', sample_count: 5 }];
    const present = new RecordingTransport(Results.ok(encounters));
    expect(await withTransport(present).getEncounters(SPEC)).toEqual(Results.ok(encounters));
    expect(present.reads).toEqual(['SubtletyRogue/encounters.json']);

    const missingIndex = new RecordingTransport(Results.missing('Not yet ingested.'));
    expect(await withTransport(missingIndex).getEncounters(SPEC)).toEqual(Results.ok([]));

    const outage = new RecordingTransport(Results.transient('WCL is unreachable right now.'));
    expect(await withTransport(outage).getEncounters(SPEC)).toEqual(Results.transient('WCL is unreachable right now.'));
  });

  it('reads the spec universe at spec-meta.json, folding a missing manifest to [] but surfacing a real failure', async () => {
    const metas: SpecMeta[] = [{
      spec: SPEC,
      className: 'Rogue',
      specName: 'Subtlety',
      classLabel: 'Rogue',
      specLabel: 'Subtlety',
      classIcon: 'class_rogue',
      specIcon: 'ability_stealth',
    }];
    const present = new RecordingTransport(Results.ok(metas));
    expect(await withTransport(present).getSpecMeta()).toEqual(Results.ok(metas));
    expect(present.reads).toEqual(['spec-meta.json']);

    const fresh = new RecordingTransport(Results.missing('Not yet ingested.'));
    expect(await withTransport(fresh).getSpecMeta()).toEqual(Results.ok([]));

    const outage = new RecordingTransport(Results.transient('WCL is unreachable right now.'));
    expect(await withTransport(outage).getSpecMeta()).toEqual(Results.transient('WCL is unreachable right now.'));
  });

  it('reads the Northern Sky phases at northern-sky-phases.json, folding a missing file to {} but surfacing a real failure', async () => {
    const phases: NorthernSkyPhases = { [ENCOUNTER_ID]: [{ phase: 1, start_s: 0 }, { phase: 2, start_s: 56 }] };
    const present = new RecordingTransport(Results.ok(phases));
    expect(await withTransport(present).getNorthernSkyPhases()).toEqual(Results.ok(phases));
    expect(present.reads).toEqual(['northern-sky-phases.json']);

    const beforeFirstPull = new RecordingTransport(Results.missing('Not yet ingested.'));
    expect(await withTransport(beforeFirstPull).getNorthernSkyPhases()).toEqual(Results.ok({}));

    const outage = new RecordingTransport(Results.transient('WCL is unreachable right now.'));
    expect(await withTransport(outage).getNorthernSkyPhases()).toEqual(Results.transient('WCL is unreachable right now.'));
  });
});

describe('DataFileApiService writes and listing', () => {
  it('writes a tailored bench to {spec}/{bench}/{enc}.json', async () => {
    const transport = new RecordingTransport();
    const data = { computed: true };
    await withTransport(transport).writeBench(SPEC, ENCOUNTER_ID, BENCH, data);
    expect(transport.writes).toEqual([['SubtletyRogue/burst/3176.json', data]]);
  });

  it('writes the ingest state to {spec}/ingest-state.json', async () => {
    const transport = new RecordingTransport();
    const data = { ingest_version: 26, ingested_at_s: 1787332065, empty_encounter_ids: [ENCOUNTER_ID] };
    await withTransport(transport).writeIngestState(SPEC, data);
    expect(transport.writes).toEqual([['SubtletyRogue/ingest-state.json', data]]);
  });

  it('writes the spec manifest to index.json', async () => {
    const transport = new RecordingTransport();
    const specs: SpecEntry[] = [{ spec: SPEC, encounter_count: 1 }];
    await withTransport(transport).writeSpecs(specs);
    expect(transport.writes).toEqual([['index.json', specs]]);
  });

  it('removes a tailored bench at {spec}/{bench}/{enc}.json', async () => {
    const transport = new RecordingTransport();
    await withTransport(transport).removeBench(SPEC, ENCOUNTER_ID, BENCH);
    expect(transport.removes).toEqual(['SubtletyRogue/burst/3176.json']);
  });

  it('lists bench files under {spec}/{bench}', async () => {
    const transport = new RecordingTransport(Results.ok(null), ['3176.json', '3177.json']);
    const files = await withTransport(transport).listBenchFiles(SPEC, BENCH);
    expect(files).toEqual(['3176.json', '3177.json']);
    expect(transport.lists).toEqual(['SubtletyRogue/burst']);
  });

  it('lists spec folders from the root, dropping any name with a dot so index.json is not a spec', async () => {
    const transport = new RecordingTransport(Results.ok(null), ['SubtletyRogue', 'FireMage', 'index.json', '.gitkeep']);
    const specs = await withTransport(transport).listSpecs();
    expect(specs).toEqual(['SubtletyRogue', 'FireMage']);
    expect(transport.lists).toEqual(['']);
  });
});
