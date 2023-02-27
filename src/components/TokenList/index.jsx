import { ethers } from "ethers";
import { MDBDataTableV5 } from "mdbreact";
import { InputGroup, FormControl, Button, Modal } from "react-bootstrap";
import { useSelector, useDispatch } from "react-redux";
import React, { useState } from "react";

import {
  addToken,
  removeToken,
  updateToken,
} from "../../store/reducers/app-slice";

const TokenList = () => {
  const dispatch = useDispatch();
  const appData = useSelector((state) => state.app);
  const [address, setAddress] = useState("");
  const [show, setShow] = useState(false);

  const handleClose = () => {
    setShow(false);
    setAddress("");
  };

  const handleShow = () => setShow(true);

  const handleAddress = (e) => {
    setAddress(e.target.value);
  };

  const addTokenList = () => {
    setShow(false);
    if (address === "") {
      alert("Please check Address");
      return;
    } else {
      try {
        const checksumAddress = ethers.utils.getAddress(address);
        dispatch(addToken(checksumAddress));
      } catch (e) {
        alert("Invalid token address");
      }
    }
    setAddress("");
  };

  const deleteTokenList = (id) => {
    dispatch(removeToken(id));
  };

  const setTokenActive = (crypto) => {
    console.log(crypto)
    dispatch(updateToken({ ...crypto, active: !crypto.active }));
  };

  const rows = appData.tokens.map((crypto) => {
    const row = { ...crypto };
    row.actions = (
      <div>
        <Button
          variant={`${crypto.active ? "primary" : "danger"}`}
          size="sm"
          value={crypto.active ? "Active" : "Disable"}
          onClick={() => setTokenActive(crypto)}
        >
          {!crypto.active ? "Active" : "Disable"}
        </Button>
        <Button
          variant="outline-danger"
          size="sm"
          onClick={() => deleteTokenList(crypto.key)}
        >
          Delete
        </Button>
      </div>
    );
    row.active = row.active ? "Actived" : "Disabled";
    return row;
  });

  const data = {
    columns: [
      {
        label: "No",
        field: "id",
        width: 150,
      },
      {
        label: "Token Symbol",
        field: "symbol",
        width: 200,
      },
      {
        label: "Token Address",
        field: "address",
        width: 270,
      },
      {
        label: "Decimals",
        field: "decimals",
        width: 50,
      },
      {
        label: "Active",
        field: "active",
        width: 270,
      },
      {
        label: "Actions",
        field: "actions",
        width: 100,
      },
    ],
    rows: rows,
  };

  return (
    <div>
      <h2>Token List</h2>
      <hr />
      <br />
      <br />
      <Button variant="primary" onClick={handleShow}>
        Add Token
      </Button>
      <br />
      <br />
      <MDBDataTableV5
        hover
        entriesOptions={[10, 20, 50, 100, 200, 500, 1000]}
        entries={50}
        pagesAmount={10}
        data={data}
        materialSearch
      />
      <br />
      <br />
      <Modal show={show} onHide={handleClose}>
        <Modal.Header closeButton>
          <Modal.Title>Add Token Address</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <InputGroup className="mb-3">
            <InputGroup.Text id="basic-addon3">Address</InputGroup.Text>
            <FormControl
              id="basic-url1"
              aria-describedby="basic-addon3"
              type="text"
              placeholder="0x"
              defaultValue={address}
              onChange={handleAddress}
            />
          </InputGroup>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleClose}>
            Close
          </Button>
          <Button variant="primary" onClick={addTokenList}>
            Add token
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default TokenList;
