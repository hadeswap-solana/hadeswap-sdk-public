import { web3 } from '@project-serum/anchor';

export const METADATA_PROGRAM_PUBKEY = new web3.PublicKey('metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s');

export const AUTHORIZATION_RULES_PROGRAM = new web3.PublicKey(
    "auth9SigNpDKz4sJJ1DfCTuZrZNSAgh9sFD3rboVmgg"
  )

export const METADATA_PREFIX = 'metadata';

export const EDITION_PREFIX = 'edition';

export const FEE_PREFIX = 'fee_vault';

export const TOKEN_RECORD: string = 'token_record';

export const SOL_FUNDS_PREFIX = 'sol_funds_vault';

export const NFTS_OWNER_PREFIX = 'nfts_owner';

export const EMPTY_PUBKEY = new web3.PublicKey('11111111111111111111111111111111');

export const ENCODER = new TextEncoder();

export const BASE_POINTS = 10000;
