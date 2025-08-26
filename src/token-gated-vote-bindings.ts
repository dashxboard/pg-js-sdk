import { Buffer } from "buffer";
import {
  AssembledTransaction,
  Client as ContractClient,
  ClientOptions as ContractClientOptions,
  MethodOptions,
  Result,
  Spec as ContractSpec,
} from "@stellar/stellar-sdk/contract";
import type { u64, i128 } from "@stellar/stellar-sdk/contract";

export type TokenGatedVoteContractDataKey =
  | { tag: "Admin"; values: void }
  | { tag: "Token"; values: void }
  | { tag: "Proposal"; values: readonly [string] }
  | { tag: "Proposals"; values: void }
  | { tag: "Votes"; values: readonly [string] };

export interface TokenGatedVoteProposalData {
  description: string;
  end_time: u64;
  start_time: u64;
  total_abstain: i128;
  total_against: i128;
  total_for: i128;
}

export interface TokenGatedVoteProposalSummary {
  description: string;
  id: string;
  status: TokenGatedVoteProposalStatus;
}

export type TokenGatedVoteProposalStatus =
  | { tag: "Pending"; values: void }
  | { tag: "Active"; values: void }
  | { tag: "Ended"; values: void };

export const TokenGatedVoteContractErrors = {
  1: { message: "ContractNotInitialized" },
  2: { message: "ContractAlreadyInitialized" },
  3: { message: "ProposalAlreadyExists" },
  4: { message: "ProposalNotFound" },
  5: { message: "UserAlreadyVoted" },
  6: { message: "UserCannotVote" },
  7: { message: "VotingNotActive" },
  8: { message: "InvalidChoice" },
  9: { message: "StartTimeAfterEnd" },
  10: { message: "StartTimeInPast" },
  11: { message: "DurationTooLong" },
  12: { message: "DurationTooShort" },
};

export interface Client {
  create_proposal: (
    {
      id,
      description,
      start_time,
      end_time,
    }: { id: string; description: string; start_time: u64; end_time: u64 },
    options?: {
      fee?: number;
      timeoutInSeconds?: number;
      simulate?: boolean;
    }
  ) => Promise<AssembledTransaction<Result<void>>>;

  vote: (
    { user, id, choice }: { user: string; id: string; choice: string },
    options?: {
      fee?: number;
      timeoutInSeconds?: number;
      simulate?: boolean;
    }
  ) => Promise<AssembledTransaction<Result<void>>>;

  transfer_admin: (
    { new_admin }: { new_admin: string },
    options?: {
      fee?: number;
      timeoutInSeconds?: number;
      simulate?: boolean;
    }
  ) => Promise<AssembledTransaction<Result<void>>>;

  get_governance_details: (options?: {
    fee?: number;
    timeoutInSeconds?: number;
    simulate?: boolean;
  }) => Promise<AssembledTransaction<Array<TokenGatedVoteProposalSummary>>>;

  get_proposal_details: (
    { id }: { id: string },
    options?: {
      fee?: number;
      timeoutInSeconds?: number;
      simulate?: boolean;
    }
  ) => Promise<AssembledTransaction<Result<TokenGatedVoteProposalData>>>;

  get_user_details: (
    { user }: { user: string },
    options?: {
      fee?: number;
      timeoutInSeconds?: number;
      simulate?: boolean;
    }
  ) => Promise<
    AssembledTransaction<Result<Array<readonly [string, boolean, i128]>>>
  >;
}
export class Client extends ContractClient {
  static async deploy<T = Client>(
    { admin, token }: { admin: string; token: string },
    options: MethodOptions &
      Omit<ContractClientOptions, "contractId"> & {
        wasmHash: Buffer | string;
        salt?: Buffer | Uint8Array;
        format?: "hex" | "base64";
      }
  ): Promise<AssembledTransaction<T>> {
    return ContractClient.deploy({ admin, token }, options);
  }
  constructor(public readonly options: ContractClientOptions) {
    super(
      new ContractSpec([
        "AAAAAgAAAAAAAAAAAAAAHVRva2VuR2F0ZWRWb3RlQ29udHJhY3REYXRhS2V5AAAAAAAABQAAAAAAAAAAAAAABUFkbWluAAAAAAAAAAAAAAAAAAAFVG9rZW4AAAAAAAABAAAAAAAAAAhQcm9wb3NhbAAAAAEAAAARAAAAAAAAAAAAAAAJUHJvcG9zYWxzAAAAAAAAAQAAAAAAAAAFVm90ZXMAAAAAAAABAAAAEw==",
        "AAAAAQAAAAAAAAAAAAAAGlRva2VuR2F0ZWRWb3RlUHJvcG9zYWxEYXRhAAAAAAAGAAAAAAAAAAtkZXNjcmlwdGlvbgAAAAAQAAAAAAAAAAhlbmRfdGltZQAAAAYAAAAAAAAACnN0YXJ0X3RpbWUAAAAAAAYAAAAAAAAADXRvdGFsX2Fic3RhaW4AAAAAAAALAAAAAAAAAA10b3RhbF9hZ2FpbnN0AAAAAAAACwAAAAAAAAAJdG90YWxfZm9yAAAAAAAACw==",
        "AAAAAQAAAAAAAAAAAAAAHVRva2VuR2F0ZWRWb3RlUHJvcG9zYWxTdW1tYXJ5AAAAAAAAAwAAAAAAAAALZGVzY3JpcHRpb24AAAAAEAAAAAAAAAACaWQAAAAAABEAAAAAAAAABnN0YXR1cwAAAAAH0AAAABxUb2tlbkdhdGVkVm90ZVByb3Bvc2FsU3RhdHVz",
        "AAAAAgAAAAAAAAAAAAAAHFRva2VuR2F0ZWRWb3RlUHJvcG9zYWxTdGF0dXMAAAADAAAAAAAAAAAAAAAHUGVuZGluZwAAAAAAAAAAAAAAAAZBY3RpdmUAAAAAAAAAAAAAAAAABUVuZGVkAAAA",
        "AAAABAAAAAAAAAAAAAAAHFRva2VuR2F0ZWRWb3RlQ29udHJhY3RFcnJvcnMAAAAMAAAAAAAAABZDb250cmFjdE5vdEluaXRpYWxpemVkAAAAAAABAAAAAAAAABpDb250cmFjdEFscmVhZHlJbml0aWFsaXplZAAAAAAAAgAAAAAAAAAVUHJvcG9zYWxBbHJlYWR5RXhpc3RzAAAAAAAAAwAAAAAAAAAQUHJvcG9zYWxOb3RGb3VuZAAAAAQAAAAAAAAAEFVzZXJBbHJlYWR5Vm90ZWQAAAAFAAAAAAAAAA5Vc2VyQ2Fubm90Vm90ZQAAAAAABgAAAAAAAAAPVm90aW5nTm90QWN0aXZlAAAAAAcAAAAAAAAADUludmFsaWRDaG9pY2UAAAAAAAAIAAAAAAAAABFTdGFydFRpbWVBZnRlckVuZAAAAAAAAAkAAAAAAAAAD1N0YXJ0VGltZUluUGFzdAAAAAAKAAAAAAAAAA9EdXJhdGlvblRvb0xvbmcAAAAACwAAAAAAAAAQRHVyYXRpb25Ub29TaG9ydAAAAAw=",
        "AAAAAAAAAAAAAAANX19jb25zdHJ1Y3RvcgAAAAAAAAIAAAAAAAAABWFkbWluAAAAAAAAEwAAAAAAAAAFdG9rZW4AAAAAAAATAAAAAQAAA+kAAAPtAAAAAAAAB9AAAAAcVG9rZW5HYXRlZFZvdGVDb250cmFjdEVycm9ycw==",
        "AAAAAAAAAAAAAAAPY3JlYXRlX3Byb3Bvc2FsAAAAAAQAAAAAAAAAAmlkAAAAAAARAAAAAAAAAAtkZXNjcmlwdGlvbgAAAAAQAAAAAAAAAApzdGFydF90aW1lAAAAAAAGAAAAAAAAAAhlbmRfdGltZQAAAAYAAAABAAAD6QAAA+0AAAAAAAAH0AAAABxUb2tlbkdhdGVkVm90ZUNvbnRyYWN0RXJyb3Jz",
        "AAAAAAAAAAAAAAAEdm90ZQAAAAMAAAAAAAAABHVzZXIAAAATAAAAAAAAAAJpZAAAAAAAEQAAAAAAAAAGY2hvaWNlAAAAAAARAAAAAQAAA+kAAAPtAAAAAAAAB9AAAAAcVG9rZW5HYXRlZFZvdGVDb250cmFjdEVycm9ycw==",
        "AAAAAAAAAAAAAAAOdHJhbnNmZXJfYWRtaW4AAAAAAAEAAAAAAAAACW5ld19hZG1pbgAAAAAAABMAAAABAAAD6QAAA+0AAAAAAAAH0AAAABxUb2tlbkdhdGVkVm90ZUNvbnRyYWN0RXJyb3Jz",
        "AAAAAAAAAAAAAAAWZ2V0X2dvdmVybmFuY2VfZGV0YWlscwAAAAAAAAAAAAEAAAPqAAAH0AAAAB1Ub2tlbkdhdGVkVm90ZVByb3Bvc2FsU3VtbWFyeQAAAA==",
        "AAAAAAAAAAAAAAAUZ2V0X3Byb3Bvc2FsX2RldGFpbHMAAAABAAAAAAAAAAJpZAAAAAAAEQAAAAEAAAPpAAAH0AAAABpUb2tlbkdhdGVkVm90ZVByb3Bvc2FsRGF0YQAAAAAH0AAAABxUb2tlbkdhdGVkVm90ZUNvbnRyYWN0RXJyb3Jz",
        "AAAAAAAAAAAAAAAQZ2V0X3VzZXJfZGV0YWlscwAAAAEAAAAAAAAABHVzZXIAAAATAAAAAQAAA+kAAAPqAAAD7QAAAAMAAAARAAAAAQAAAAsAAAfQAAAAHFRva2VuR2F0ZWRWb3RlQ29udHJhY3RFcnJvcnM=",
      ]),
      options
    );
  }
  public readonly fromJSON = {
    create_proposal: this.txFromJSON<Result<void>>,
    vote: this.txFromJSON<Result<void>>,
    transfer_admin: this.txFromJSON<Result<void>>,
    get_governance_details: this.txFromJSON<
      Array<TokenGatedVoteProposalSummary>
    >,
    get_proposal_details: this.txFromJSON<Result<TokenGatedVoteProposalData>>,
    get_user_details: this.txFromJSON<
      Result<Array<readonly [string, boolean, i128]>>
    >,
  };
}
