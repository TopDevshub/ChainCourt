import { Buffer } from "buffer";
import { Address } from "@stellar/stellar-sdk";
import {
  AssembledTransaction,
  Client as ContractClient,
  ClientOptions as ContractClientOptions,
  MethodOptions,
  Result,
  Spec as ContractSpec,
} from "@stellar/stellar-sdk/contract";
import type {
  u32,
  i32,
  u64,
  i64,
  u128,
  i128,
  u256,
  i256,
  Option,
  Timepoint,
  Duration,
} from "@stellar/stellar-sdk/contract";
export * from "@stellar/stellar-sdk";
export * as contract from "@stellar/stellar-sdk/contract";
export * as rpc from "@stellar/stellar-sdk/rpc";

if (typeof window !== "undefined") {
  //@ts-ignore Buffer exists
  window.Buffer = window.Buffer || Buffer;
}


export const networks = {
  testnet: {
    networkPassphrase: "Test SDF Network ; September 2015",
    contractId: "CAHJ2VHXHV32XRZG2DB37M7C6YVTOBCAGOF34HHP4U3X5Z5P43BCRUYA",
  }
} as const


export interface Escrow {
  ai_summary: string;
  amount: i128;
  client: string;
  contractor: string;
  id: string;
  state: EscrowState;
  votes_client: u32;
  votes_contractor: u32;
}

export type DataKey = {tag: "Escrow", values: readonly [string]} | {tag: "JurorVote", values: readonly [string, string]};

export type VoteOption = {tag: "Client", values: void} | {tag: "Contractor", values: void};

export type EscrowState = {tag: "Active", values: void} | {tag: "Disputed", values: void} | {tag: "Voting", values: void} | {tag: "Resolved", values: void};

export interface Client {
  /**
   * Construct and simulate a cast_vote transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   */
  cast_vote: ({id, juror, vote}: {id: string, juror: string, vote: VoteOption}, options?: MethodOptions) => Promise<AssembledTransaction<null>>

  /**
   * Construct and simulate a get_escrow transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   */
  get_escrow: ({id}: {id: string}, options?: MethodOptions) => Promise<AssembledTransaction<Escrow>>

  /**
   * Construct and simulate a create_escrow transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   */
  create_escrow: ({id, token, client, contractor, amount}: {id: string, token: string, client: string, contractor: string, amount: i128}, options?: MethodOptions) => Promise<AssembledTransaction<null>>

  /**
   * Construct and simulate a raise_dispute transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   */
  raise_dispute: ({id, caller, ai_summary}: {id: string, caller: string, ai_summary: string}, options?: MethodOptions) => Promise<AssembledTransaction<null>>

  /**
   * Construct and simulate a execute_verdict transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   */
  execute_verdict: ({id, token}: {id: string, token: string}, options?: MethodOptions) => Promise<AssembledTransaction<null>>

  /**
   * Construct and simulate a escalate_to_jury transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   */
  escalate_to_jury: ({id, caller}: {id: string, caller: string}, options?: MethodOptions) => Promise<AssembledTransaction<null>>

}
export class Client extends ContractClient {
  static async deploy<T = Client>(
    /** Options for initializing a Client as well as for calling a method, with extras specific to deploying. */
    options: MethodOptions &
      Omit<ContractClientOptions, "contractId"> & {
        /** The hash of the Wasm blob, which must already be installed on-chain. */
        wasmHash: Buffer | string;
        /** Salt used to generate the contract's ID. Passed through to {@link Operation.createCustomContract}. Default: random. */
        salt?: Buffer | Uint8Array;
        /** The format used to decode `wasmHash`, if it's provided as a string. */
        format?: "hex" | "base64";
      }
  ): Promise<AssembledTransaction<T>> {
    return ContractClient.deploy(null, options)
  }
  constructor(public readonly options: ContractClientOptions) {
    super(
      new ContractSpec([ "AAAAAQAAAAAAAAAAAAAABkVzY3JvdwAAAAAACAAAAAAAAAAKYWlfc3VtbWFyeQAAAAAAEAAAAAAAAAAGYW1vdW50AAAAAAALAAAAAAAAAAZjbGllbnQAAAAAABMAAAAAAAAACmNvbnRyYWN0b3IAAAAAABMAAAAAAAAAAmlkAAAAAAAQAAAAAAAAAAVzdGF0ZQAAAAAAB9AAAAALRXNjcm93U3RhdGUAAAAAAAAAAAx2b3Rlc19jbGllbnQAAAAEAAAAAAAAABB2b3Rlc19jb250cmFjdG9yAAAABA==",
        "AAAAAgAAAAAAAAAAAAAAB0RhdGFLZXkAAAAAAgAAAAEAAAAAAAAABkVzY3JvdwAAAAAAAQAAABAAAAABAAAAAAAAAAlKdXJvclZvdGUAAAAAAAACAAAAEAAAABM=",
        "AAAAAgAAAAAAAAAAAAAAClZvdGVPcHRpb24AAAAAAAIAAAAAAAAAAAAAAAZDbGllbnQAAAAAAAAAAAAAAAAACkNvbnRyYWN0b3IAAA==",
        "AAAAAgAAAAAAAAAAAAAAC0VzY3Jvd1N0YXRlAAAAAAQAAAAAAAAAAAAAAAZBY3RpdmUAAAAAAAAAAAAAAAAACERpc3B1dGVkAAAAAAAAAAAAAAAGVm90aW5nAAAAAAAAAAAAAAAAAAhSZXNvbHZlZA==",
        "AAAAAAAAAAAAAAAJY2FzdF92b3RlAAAAAAAAAwAAAAAAAAACaWQAAAAAABAAAAAAAAAABWp1cm9yAAAAAAAAEwAAAAAAAAAEdm90ZQAAB9AAAAAKVm90ZU9wdGlvbgAAAAAAAA==",
        "AAAAAAAAAAAAAAAKZ2V0X2VzY3JvdwAAAAAAAQAAAAAAAAACaWQAAAAAABAAAAABAAAH0AAAAAZFc2Nyb3cAAA==",
        "AAAAAAAAAAAAAAANY3JlYXRlX2VzY3JvdwAAAAAAAAUAAAAAAAAAAmlkAAAAAAAQAAAAAAAAAAV0b2tlbgAAAAAAABMAAAAAAAAABmNsaWVudAAAAAAAEwAAAAAAAAAKY29udHJhY3RvcgAAAAAAEwAAAAAAAAAGYW1vdW50AAAAAAALAAAAAA==",
        "AAAAAAAAAAAAAAANcmFpc2VfZGlzcHV0ZQAAAAAAAAMAAAAAAAAAAmlkAAAAAAAQAAAAAAAAAAZjYWxsZXIAAAAAABMAAAAAAAAACmFpX3N1bW1hcnkAAAAAABAAAAAA",
        "AAAAAAAAAAAAAAAPZXhlY3V0ZV92ZXJkaWN0AAAAAAIAAAAAAAAAAmlkAAAAAAAQAAAAAAAAAAV0b2tlbgAAAAAAABMAAAAA",
        "AAAAAAAAAAAAAAAQZXNjYWxhdGVfdG9fanVyeQAAAAIAAAAAAAAAAmlkAAAAAAAQAAAAAAAAAAZjYWxsZXIAAAAAABMAAAAA" ]),
      options
    )
  }
  public readonly fromJSON = {
    cast_vote: this.txFromJSON<null>,
        get_escrow: this.txFromJSON<Escrow>,
        create_escrow: this.txFromJSON<null>,
        raise_dispute: this.txFromJSON<null>,
        execute_verdict: this.txFromJSON<null>,
        escalate_to_jury: this.txFromJSON<null>
  }
}