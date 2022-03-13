import express, { Express, Request, Response } from "express";
import bodyParser from "body-parser";
import helmet from "helmet";
import cors from "cors";
import dotenv from "dotenv";

//Merkle Tree
import MerkleTree from "merkletreejs";
import keccak256 from "keccak256";

dotenv.config();

const PORT = process.env.PORT || 3000;

const app: Express = express();

app.use(helmet());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

var corsOptions = {
  origin: "*",
  optionsSuccessStatus: 200, // For legacy browser support
};

app.use(cors(corsOptions));

//Temp Ethereum addresses
let addresses: string[] = [];
let merkleTree: any;

const setMerkle = () => {
  // Hash leaves
  let leaves = addresses.map((addr) => keccak256(addr));
  //Create tree
  merkleTree = new MerkleTree(leaves, keccak256, { sortPairs: true });
};
//Get Root
const getRoot = (addresses: string[]) => {
  setMerkle();
  let rootHash = merkleTree.getRoot().toString("hex");

  return rootHash;
};

//Get Proof
const getProof = (address: string) => {
  setMerkle();
  let hashedAddress = keccak256(address);
  let proof = merkleTree.getHexProof(hashedAddress);
  return proof;
};

app.get("/", (req: Request, res: Response) => {
  res.json("Hello from the TypeScript world!");
});

app.get("/all", (req: Request, res: Response) => {
  res.json({ addresses: addresses });
});

app.get("/add/:address", (req, res) => {
  if (!addresses.includes(req.params.address)) {
    addresses.push(req.params.address);
    res.json({ root: getRoot(addresses), addresses: addresses });
  } else {
    res.json({ root: "Address already exists" });
  }
});

app.get("/get/:address", (req, res) => {
  res.json({ proof: getProof(req.params.address) });
});

app.listen(PORT, () => console.log(`Running on ${PORT} ⚡`));
