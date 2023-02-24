import { MDBDataTableV5 } from "mdbreact";
import { useSelector } from "react-redux";
import { FiMonitor, FiUserPlus } from "react-icons/fi";
import { BsClockHistory } from "react-icons/bs";
import { GiReceiveMoney } from "react-icons/gi";
import { Button, InputGroup, Form, Modal, Card } from "react-bootstrap";
import React, { useEffect, useState } from "react";

const Display = () => {
  const appData = useSelector((state) => state.app);
  const [show, setShow] = useState(false);
  const [isLogDialogFlog, setLogDialogFlog] = useState(false);
  const [selectedToken, setToken] = useState({});
  const [minAmount, setMinAmount] = useState(0);
  const [maxAmount, setMaxAmount] = useState(100);
  const [tokenLists, setTokenLists] = useState([]);
  const [priceData, setPriceData] = useState();
  const [logData, setLogData] = useState();
  const [executionState, setExecutionState] = useState(false);
  const [ownerAddress, setOwnerAddress] = useState("");
  const [ownerPrivateKey, setOwnerPrivateKey] = useState("");
  const inputRegex = RegExp(`^\\d*(?:\\\\[.])?\\d*$`);

  useEffect(() => {
    if (appData.loading === "success") {
      const tokens = appData.tokens
        .filter((token) => token.active)
        .map((token) => ({
          ...token,
          minAmount: 0,
          maxAmount: 100,
        }));
      setTokenLists(tokens);
    }
  }, [appData.tokens]);

  const start = () => {
    console.log("bot starting...");
    setExecutionState(true);
  };

  const stop = () => {
    console.log("bot stopping...");
    setExecutionState(false);
  };

  const clearLog = () => {
    setLogDialogFlog(false);
    console.log("clear log.");
  };

  const handleOwnerAddress = (e) => {
    setOwnerAddress(e.target.value);
  };

  const handleOwnerPrivateKey = (e) => {
    setOwnerPrivateKey(e.target.value);
  };

  const handleClose = () => {
    setShow(false);
  };

  const handleOK = () => {
    const updatedTokenLists = tokenLists.map((tokenList) => {
      if (tokenList === selectedToken) {
        if (Number(minAmount) < Number(maxAmount)) {
          tokenList.minAmount = Number(minAmount);
          tokenList.maxAmount = Number(maxAmount);
        }
      }
      return tokenList;
    });
    setTokenLists(updatedTokenLists);
    setShow(false);
  };

  const handleMaxAmount = (value) => {
    if (inputRegex.test(value)) {
      setMaxAmount(value);
    }
  };

  const handleMinAmount = (value) => {
    if (inputRegex.test(value)) {
      setMinAmount(value);
    }
  };

  const showSettingAmountModel = (tokenAddress) => {
    setShow(true);
    const token = tokenLists.filter(
      (tokenList) => tokenList.address === tokenAddress,
    )[0];
    setToken(token);
  };

  const tokenSettingData = tokenLists.map((tokenList) => {
    const token = { ...tokenList };
    token.min_amount = tokenList.minAmount;
    token.max_amount = tokenList.maxAmount;
    token.actions = (
      <div>
        <Button
          variant="outline-success"
          size="sm"
          onClick={() => showSettingAmountModel(tokenList.address)}
        >
          {" "}
          Edit
        </Button>{" "}
      </div>
    );
    return token;
  });

  const dataPriceTable = {
    columns: [
      {
        label: "Token",
        field: "symbol",
      },
      {
        label: "Binance",
        field: "binance",
      },
      {
        label: "UniswapV2",
        field: "uni_v2",
      },
      {
        label: "UniSwapV3",
        field: "uni_v3",
      },
    ],
    rows: priceData,
  };

  const dataTokenSettingTable = {
    columns: [
      {
        label: "Token",
        field: "symbol",
      },
      {
        label: "Min Amount",
        field: "min_amount",
      },
      {
        label: "Max Amount",
        field: "max_amount",
      },
      {
        label: "Edit",
        field: "actions",
      },
    ],
    rows: tokenSettingData,
  };

  const dataLogTable = {
    columns: [
      {
        label: "TimeStamp",
        field: "timeStamp",
        width: 150,
      },
      {
        label: "Trade Token",
        field: "tradeToken",
        width: 270,
      },
      {
        label: "Trade Amount",
        field: "autoAmount",
        width: 200,
      },
      {
        label: "Buy Exchange",
        field: "firstDex",
        width: 100,
      },
      {
        label: "Sell Exchange",
        field: "secondDex",
        width: 100,
      },
      {
        label: "Trade Rate",
        field: "tradeRate",
        width: 100,
      },
    ],
    rows: logData,
  };

  return (
    <div>
      <div className="row">
        <div className="col-7">
          <Card
            bg="light"
            style={{ height: "35rem", overflow: "scroll" }}
            border="primary"
            overflow="scroll"
          >
            <Card.Body>
              <Card.Title>
                <h2>
                  {" "}
                  <FiMonitor /> &nbsp; Token Price Monitor
                </h2>{" "}
                <hr />
              </Card.Title>
              <MDBDataTableV5
                hover
                entriesOptions={[10, 20, 50, 100, 200, 500, 1000]}
                entries={50}
                pagesAmount={10}
                data={dataPriceTable}
                materialSearch
              />
              <br />
              <br />
            </Card.Body>
          </Card>
          <br />

          <Card
            bg="light"
            style={{ height: "30rem", overflow: "scroll" }}
            border="primary"
          >
            <Card.Body>
              <div className="row">
                <div className="col-10">
                  <Card.Title>
                    <h2>
                      {" "}
                      <BsClockHistory /> &nbsp; Trade Log
                    </h2>{" "}
                  </Card.Title>
                </div>
                <div className="col-2">
                  <Button
                    variant="primary"
                    id="button-addon2"
                    onClick={() => setLogDialogFlog(true)}
                  >
                    clear
                  </Button>
                </div>
              </div>
              <hr />

              <MDBDataTableV5
                hover
                entriesOptions={[10, 20, 50, 100, 200, 500, 1000]}
                entries={50}
                pagesAmount={1000}
                data={dataLogTable}
              />
            </Card.Body>
          </Card>
        </div>
        <div className="col-5">
          <Card
            bg="light"
            style={{ height: "67rem", overflow: "scroll" }}
            border="primary"
          >
            <Card.Body>
              <h2>
                {" "}
                <GiReceiveMoney /> &nbsp; Trading Amount
              </h2>{" "}
              <hr />
              <br />
              <div className="col-12">
                <MDBDataTableV5
                  hover
                  searching={false}
                  entries={50}
                  pagesAmount={10}
                  data={dataTokenSettingTable}
                />
              </div>
              <br />
              <br />
              <h2>
                {" "}
                <FiUserPlus /> &nbsp; Wallet Address and Private Key
              </h2>{" "}
              <hr />
              <br />
              <div className="row">
                <div className="col-1"></div>
                <div className="col-10">
                  <InputGroup className="mb-3">
                    <Form.Control
                      placeholder="Wallet address"
                      aria-label="Recipient's username"
                      aria-describedby="basic-addon2"
                      defaultValue={ownerAddress}
                      onChange={handleOwnerAddress}
                    />
                    <Form.Control
                      placeholder="Private Key"
                      aria-label="Recipient's username"
                      aria-describedby="basic-addon2"
                      defaultValue={ownerPrivateKey}
                      onChange={handleOwnerPrivateKey}
                    />
                  </InputGroup>
                </div>
                <div className="col-1"></div>
              </div>
              <br />
              <br />
              <div className="row">
                <div className="col-1"></div>
                <div className="col-10">
                  <InputGroup className="mb-3">
                    <Button
                      variant={executionState ? "danger" : "success"}
                      id="button-addon2"
                      onClick={executionState ? () => stop() : () => start()}
                      style={{ width: "100%" }}
                    >
                      {executionState ? "Stop" : "Start"}
                    </Button>
                  </InputGroup>
                </div>
              </div>
              <br />
              <br />
            </Card.Body>
          </Card>
        </div>
      </div>
      <Modal show={isLogDialogFlog}>
        <Modal.Header closeButton onClick={() => setLogDialogFlog(false)}>
          <Modal.Title>Clear Log</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>Are you sure?</p>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setLogDialogFlog(false)}>
            No
          </Button>
          <Button variant="primary" onClick={() => clearLog()}>
            Yes
          </Button>
        </Modal.Footer>
      </Modal>
      <Modal show={show} onHide={handleClose}>
        <Modal.Header closeButton>
          <Modal.Title>Setting Token Amounts</Modal.Title>
        </Modal.Header>
        {
          <Modal.Body>
            <div className="row">
              <div className="col-12">
                <InputGroup className="mb-3">
                  <InputGroup.Text id="basic-addon3">
                    Min amount
                  </InputGroup.Text>
                  <Form.Control
                    id="basic-url"
                    aria-describedby="basic-addon3"
                    defaultValue={selectedToken.minAmount}
                    type="number"
                    pattern="^[0-9]*[.,].?[0-9]*"
                    onChange={(e) => handleMinAmount(e.target.value)}
                    placeholder="Loan Amount  X ETH X is integer"
                  />
                </InputGroup>
              </div>
            </div>
            <div className="row">
              <div className="col-12">
                <InputGroup className="mb-3">
                  <InputGroup.Text id="basic-addon3">
                    Max amount
                  </InputGroup.Text>
                  <Form.Control
                    id="basic-url"
                    aria-describedby="basic-addon3"
                    defaultValue={selectedToken.maxAmount}
                    type="number"
                    pattern="^[0-9]*[.,].?[0-9]*"
                    onChange={(e) => {
                      handleMaxAmount(e.target.value);
                    }}
                    placeholder="Loan Amount  X ETH X is integer"
                  />
                </InputGroup>
              </div>
            </div>
          </Modal.Body>
        }
        <Modal.Footer>
          <Button variant="secondary" onClick={handleClose}>
            Close
          </Button>
          <Button variant="primary" onClick={handleOK}>
            Ok
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};
export default Display;
