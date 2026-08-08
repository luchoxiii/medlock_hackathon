import type * as __compactRuntime from '@midnight-ntwrk/compact-runtime';

export type Witnesses<PS> = {
  adminSecretKey(context: __compactRuntime.WitnessContext<Ledger, PS>): [PS, Uint8Array];
  patientBloodType(context: __compactRuntime.WitnessContext<Ledger, PS>): [PS, Uint8Array];
  patientConsent(context: __compactRuntime.WitnessContext<Ledger, PS>): [PS, boolean];
  patientSerologyClean(context: __compactRuntime.WitnessContext<Ledger, PS>): [PS, boolean];
  doctorSecretKey(context: __compactRuntime.WitnessContext<Ledger, PS>): [PS, Uint8Array];
  attestationNonce(context: __compactRuntime.WitnessContext<Ledger, PS>): [PS, Uint8Array];
  findDoctorPath(context: __compactRuntime.WitnessContext<Ledger, PS>,
                 leaf_0: Uint8Array): [PS, { leaf: Uint8Array,
                                             path: { sibling: { field: bigint },
                                                     goes_left: boolean
                                                   }[]
                                           }];
}

export type ImpureCircuits<PS> = {
  add_authorized_doctor(context: __compactRuntime.CircuitContext<PS>,
                        doctorCommitment_0: Uint8Array): __compactRuntime.CircuitResults<PS, []>;
  revoke_doctor(context: __compactRuntime.CircuitContext<PS>,
                doctorCommitment_0: Uint8Array): __compactRuntime.CircuitResults<PS, []>;
  verify_emergency_match(context: __compactRuntime.CircuitContext<PS>,
                         requiredBloodType_0: Uint8Array): __compactRuntime.CircuitResults<PS, []>;
}

export type ProvableCircuits<PS> = {
  add_authorized_doctor(context: __compactRuntime.CircuitContext<PS>,
                        doctorCommitment_0: Uint8Array): __compactRuntime.CircuitResults<PS, []>;
  revoke_doctor(context: __compactRuntime.CircuitContext<PS>,
                doctorCommitment_0: Uint8Array): __compactRuntime.CircuitResults<PS, []>;
  verify_emergency_match(context: __compactRuntime.CircuitContext<PS>,
                         requiredBloodType_0: Uint8Array): __compactRuntime.CircuitResults<PS, []>;
}

export type PureCircuits = {
}

export type Circuits<PS> = {
  add_authorized_doctor(context: __compactRuntime.CircuitContext<PS>,
                        doctorCommitment_0: Uint8Array): __compactRuntime.CircuitResults<PS, []>;
  revoke_doctor(context: __compactRuntime.CircuitContext<PS>,
                doctorCommitment_0: Uint8Array): __compactRuntime.CircuitResults<PS, []>;
  verify_emergency_match(context: __compactRuntime.CircuitContext<PS>,
                         requiredBloodType_0: Uint8Array): __compactRuntime.CircuitResults<PS, []>;
}

export type Ledger = {
  authorizedDoctors: {
    isFull(): boolean;
    checkRoot(rt_0: { field: bigint }): boolean;
    root(): __compactRuntime.MerkleTreeDigest;
    firstFree(): bigint;
    pathForLeaf(index_0: bigint, leaf_0: Uint8Array): __compactRuntime.MerkleTreePath<Uint8Array>;
    findPathForLeaf(leaf_0: Uint8Array): __compactRuntime.MerkleTreePath<Uint8Array> | undefined
  };
  revokedDoctors: {
    isEmpty(): boolean;
    size(): bigint;
    member(elem_0: Uint8Array): boolean;
    [Symbol.iterator](): Iterator<Uint8Array>
  };
  nullifiers: {
    isEmpty(): boolean;
    size(): bigint;
    member(elem_0: Uint8Array): boolean;
    [Symbol.iterator](): Iterator<Uint8Array>
  };
  readonly verificationCount: bigint;
  readonly admin: Uint8Array;
}

export type ContractReferenceLocations = any;

export declare const contractReferenceLocations : ContractReferenceLocations;

export declare class Contract<PS = any, W extends Witnesses<PS> = Witnesses<PS>> {
  witnesses: W;
  circuits: Circuits<PS>;
  impureCircuits: ImpureCircuits<PS>;
  provableCircuits: ProvableCircuits<PS>;
  constructor(witnesses: W);
  initialState(context: __compactRuntime.ConstructorContext<PS>): __compactRuntime.ConstructorResult<PS>;
}

export declare function ledger(state: __compactRuntime.StateValue | __compactRuntime.ChargedState): Ledger;
export declare const pureCircuits: PureCircuits;
