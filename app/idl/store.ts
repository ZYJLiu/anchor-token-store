export type Store = {
  "version": "0.1.0",
  "name": "store",
  "instructions": [
    {
      "name": "buy",
      "accounts": [
        {
          "name": "signer",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "storeAuthority",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "paymentTokenAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "paymentMint",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "purchaseTokenAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "purchaseMint",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "tokenProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "associatedTokenProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": []
    }
  ]
};

export const IDL: Store = {
  "version": "0.1.0",
  "name": "store",
  "instructions": [
    {
      "name": "buy",
      "accounts": [
        {
          "name": "signer",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "storeAuthority",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "paymentTokenAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "paymentMint",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "purchaseTokenAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "purchaseMint",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "tokenProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "associatedTokenProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": []
    }
  ]
};
