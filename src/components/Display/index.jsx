import { MDBDataTableV5 } from "mdbreact";
import { useSelector, useDispatch } from "react-redux";
import { FiMonitor, FiUserPlus } from "react-icons/fi";
import { BsClockHistory } from "react-icons/bs";
import { GiReceiveMoney } from "react-icons/gi";
import { Button, InputGroup, Form, Modal, Card } from "react-bootstrap";
import React, { useEffect, useState } from "react";

import { updateToken } from "../../store/reducers/app-slice";
import { providers } from "ethers";

const Display = ({ socket }) => {
  const dispatch = useDispatch();
  const appData = useSelector((state) => state.app);
  const [show, setShow] = useState(false);
  const [isLogDialogFlog, setLogDialogFlog] = useState(false);
  const [selectedToken, setToken] = useState({});
  const [minAmount, setMinAmount] = useState(0);
  const [maxAmount, setMaxAmount] = useState(100);
  const [tokenLists, setTokenLists] = useState([]);
  const [priceData, setPriceData] = useState([]);
  const [logData, setLogData] = useState();
  const [executionState, setExecutionState] = useState(false);
  const [ownerAddress, setOwnerAddress] = useState("");
  const [ownerPrivateKey, setOwnerPrivateKey] = useState("");
  const inputRegex = RegExp(`^\\d*(?:\\\\[.])?\\d*$`);

  useEffect(() => {
    if (appData.loading === "success") {
      const tokens = appData.tokens
        .filter((token) => token.active);
      setTokenLists(tokens);
    }
  }, [appData.tokens]);

  const start = () => {
    socket.emit("start");
    setExecutionState(true);
  };

  const stop = () => {
    socket.emit("stop");
    setExecutionState(false);
  };

  const clearLog = () => {
    setLogDialogFlog(false);
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
    if (Number(minAmount) < Number(maxAmount)) {
      dispatch(updateToken({ ...selectedToken, minAmount: Number(minAmount), maxAmount: Number(maxAmount) }));
      setTokenLists((tokenList) => {
        tokenList.map((token) => {
          if (token === selectedToken) {
            return { ...token, minAmount: Number(minAmount), maxAmount: Number(maxAmount) }
          } else {
            return token;
          }
        });
        return tokenList;
      });
    }
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
    if (executionState) {
      alert(`Bot is running with current setting. Please stop it first.`);
      return;
    }
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
        label: "Amount",
        width: 40,
        field: "amount",
      },
      {
        label: "",
        field: "direction",
      },
      {
        label: "Binance",
        field: "binance",
      },
      {
        label: "Fee",
        field: "binanceSwapFee",
      },
      {
        label: "UniswapV2",
        field: "uniV2",
      },
      {
        label: "UniSwapV3",
        field: "uniV3",
      },
      {
        label: "Fee",
        field: "uniV3Fee",
      },
      {
        label: "ETA Profit",
        field: "profit",
      },
      {
        label: "Last Modified",
        field: "modified",
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

  const receivePriceSignal = (data) => {
    if (priceData.length > 0 && priceData.find((price) => price.symbol === data.symbol)) {
      setPriceData((prev) => {
        return prev.map((price) => {
          if (price.symbol === data.symbol) {
            return {
              symbol: data.symbol,
              amount: data.amount,
              modified: data.modified,
              direction: price.direction,
              binance: data[price.direction].binance,
              binanceSwapFee: `${data[price.direction].binanceSwapFee.amount} ${data[price.direction].binanceSwapFee.currency.symbol}`,
              uniV2: data[price.direction].uniV2,
              uniV3: data[price.direction].uniV3,
              uniV3Fee: `${data[price.direction].uniV3Fee} USD`,
              profit: data[price.direction].etaProfit,
            }
          } else {
            return { ...price };
          }
        })
      });
    } else {
      const buy = {
        symbol: data.symbol,
        amount: data.amount,
        modified: data.modified,
        binance: data.buy.binance,
        binanceSwapFee: `${data.buy.binanceSwapFee.amount} ${data.buy.binanceSwapFee.currency.symbol}`,
        uniV2: data.buy.uniV2,
        uniV3: data.buy.uniV3,
        uniV3Fee: `${data.buy.uniV3Fee} USD`,
        profit: data.buy.etaProfit,
        direction: 'buy'
      };
      const sell = {
        symbol: data.symbol,
        amount: data.amount,
        modified: data.modified,
        binance: data.sell.binance,
        binanceSwapFee: `${data.sell.binanceSwapFee.amount} ${data.sell.binanceSwapFee.currency.symbol}`,
        uniV2: data.sell.uniV2,
        uniV3: data.sell.uniV3,
        uniV3Fee: `${data.sell.uniV3Fee} USD`,
        profit: data.sell.etaProfit,
        direction: 'sell'
      };
      setPriceData((prev) => [...prev, buy, sell]);
    }
  }

  useEffect(() => {
    console.log(priceData)
  }, [priceData])
  const receiveBotStatusSignal = (data) => {
    setExecutionState(data.status)
  }

  useEffect(() => {
    socket.on("bot-status", receiveBotStatusSignal);
    socket.on("price-signal", receivePriceSignal);
    return () => {
      socket.off("price-signal");
      socket.off("bot-status");
    }
  })

  return (
    <div>
      <div className="row">
        <div className="col-9">
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
                autoWidth={true}
                hover
                entriesOptions={[10, 20, 50, 100, 200, 500, 1000]}
                paging={false}
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
        <div className="col-3">
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
