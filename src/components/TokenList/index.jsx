import { ethers } from 'ethers';
import { MDBDataTableV5 } from 'mdbreact';
import { InputGroup, FormControl, Button, Modal } from 'react-bootstrap';
import React, { Component, useState } from 'react';

import { addressDatabaseURL, RPC_URL } from '../../utils/basic';
import { database } from '../../config/firebase';
import { erc20abi } from '../../utils/abis/erc20ABI';

const provider = new ethers.providers.JsonRpcProvider(RPC_URL);

class TokenList extends Component {
    constructor(props) {
        super(props);
        this.state = {
            prevAddress: '',
            newAddress: '',
            editKey: '',
            walletLists: [],
            show: false
        };

        this.closeModal = e => {
            this.setState({
                show: false
            });
        };
    }

    async componentWillMount() {
        await this.Init();
    }

    Init() {
        database
            .ref(addressDatabaseURL + '/')
            .get()
            .then(snapshot => {
                if (snapshot.exists) {
                    var tokenList = [];
                    const newArray = snapshot.val();
                    if (newArray) {
                        Object.keys(newArray).map((key, index) => {
                            const value = newArray[key];
                            tokenList.push({
                                id: index + 1,
                                key,
                                Address: value.Address,
                                tokenName: value.tokenName,
                            });
                        });
                    }
                    this.setState({
                        walletLists: tokenList
                    });
                }
            });
    }

    onReload = () => {
        this.Init();
    };

    closeModal() {
        console.log('close');
    }

    deleteTokenList(id) {
        console.log(id);
        database.ref(addressDatabaseURL + '/' + id).remove();
        this.Init();
    }

    setTokenActive(id) {
        console.log(id, this.state.walletLists);
        const databaseRef = database.ref(addressDatabaseURL + '/' + id);
        databaseRef.update({active: !databaseRef.active});
        this.Init();
    }

    saveWallet() {
        if (this.state.newAddress == '') {
            alert('input date');
            return;
        }

        const load = {
            Address: this.state.newAddress,
            Label: this.state.newLabel
        };
        var updates = {};
        updates[addressDatabaseURL + '/' + this.state.editKey] = load;
        database
            .ref()
            .update(updates)
            .then(function() {
                alert('Data saved successfully.');
            })
            .catch(function(error) {
                alert('Data could not be saved.' + error);
            });
        this.setState({
            show: false
        });
        this.Init();
    }

    render() {
        const rows = this.state.walletLists.map(tokenList => {
            tokenList.delete = (
                <Button
                    variant="outline-danger"
                    size="sm"
                    onClick={() => this.deleteTokenList(tokenList.key)}
                >
                    Delete
                </Button>
            );
            tokenList.active = (
                <Button
                    variant={`${tokenList.active ? "primary" : "danger"}`}
                    size="sm"
                    onClick={() => this.setTokenActive(tokenList.key)}
                >
                    {tokenList.active ? "Active": "Disable"}
                </Button>
            );
            return tokenList;
        });
        const data = {
            columns: [
                {
                    label: 'No',
                    field: 'id',
                    sort: 'asc',
                    width: 150
                },
                {
                    label: 'Token Symbol',
                    field: 'tokenName',
                    sort: 'asc',
                    width: 200
                },
                {
                    label: 'Token Address',
                    field: 'address',
                    sort: 'asc',
                    width: 270
                },
                {
                    label: 'Active',
                    field: 'active',
                    width: 270
                },
                {
                    label: 'Delete',
                    field: 'delete',
                    sort: 'asc',
                    width: 100
                }
            ],
            rows: rows
        };
        return (
            <div>
                <h2>Token List</h2>
                <hr />
                <br />
                <br />
                <Example
                    onReload={this.onReload}
                    walletData={this.state.walletLists}
                />
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
            </div>
        );
    }
}
export default TokenList;

function Example(props) {
    let addAddress = '';
    const [show, setShow] = useState(false);
    const handleClose = () => setShow(false);
    const handleShow = () => setShow(true);

    const addToken = async () => {
        setShow(false);
        if (addAddress === '') {
            alert('Please check Address');
            return;
        } else {
            addAddress = ethers.utils.getAddress(addAddress);
            try {
                const tokenContract = new ethers.Contract(addAddress, erc20abi, provider);
                console.log("tokenContract: ", tokenContract);
                const tokenName = await tokenContract["symbol"]();
                console.log("tokenName: ", tokenName);
                const tokenList = {
                    address: addAddress,
                    tokenName: tokenName,
                    active: true
                };
                const userListRef = database.ref(addressDatabaseURL);
                const newUserRef = userListRef.push();
                newUserRef.set(tokenList);
                props.onReload();
            } catch (err) {
                console.log(err);
                alert('please check token address.');
                addAddress = '';
            }
        }
    };

    const handleAddress = async e => {
        addAddress = e.target.value;
    };
    return (
        <>
            <Button variant="primary" onClick={handleShow}>
                Add Token
            </Button>

            <Modal show={show} onHide={handleClose}>
                <Modal.Header closeButton>
                    <Modal.Title>Add Token Address</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <InputGroup className="mb-3">
                        <InputGroup.Text id="basic-addon3">
                            Address
                        </InputGroup.Text>
                        <FormControl
                            id="basic-url1"
                            aria-describedby="basic-addon3"
                            type="text"
                            placeholder="0x"
                            defaultValue={addAddress}
                            onChange={handleAddress}
                        />
                    </InputGroup>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={handleClose}>
                        Close
                    </Button>
                    <Button variant="primary" onClick={addToken}>
                        Add token
                    </Button>
                </Modal.Footer>
            </Modal>
        </>
    );
}
