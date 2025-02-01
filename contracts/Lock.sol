// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.0;

// Uncomment this line to use console.log
// import "hardhat/console.sol";

contract Lock {
    struct content {
        string userStatement;
        string queryPoint;
        string intent;
        string transactionId;
        uint time;
    }

    struct addressUser {
        address add;
        string name;
    }

    mapping(address => content[]) contentList;
    mapping(address => string) private connectionString;
    mapping(address => mapping(address => bool)) ownership;
    mapping(address => addressUser[]) access;
    mapping(address => mapping(address => bool)) prevownership;

    function upload(
        address _user,
        string memory _userStatement,
        string memory _queryPoint,
        string memory _transactionId,
        string memory _intent
    ) public {
        require(
            ownership[_user][msg.sender],
            "You dont have access to upload to his database"
        );

        contentList[_user].push(
            content(
                _userStatement,
                _queryPoint,
                _transactionId,
                _intent,
                block.timestamp
            )
        );
    }
    function uploadByOur(
        string memory _userStatement,
        string memory _queryPoint,
        string memory _transactionId,
        string memory _intent
    ) public {
        contentList[msg.sender].push(
            content(
                _userStatement,
                _queryPoint,
                _transactionId,
                _intent,
                block.timestamp
            )
        );
    }

    function addPermission(address _add, string memory name) public {
        if (msg.sender == _add) {
            revert("you are only owner");
        } else if (prevownership[msg.sender][_add]) {
            ownership[msg.sender][_add] = true;
        } else {
            ownership[msg.sender][_add] = true;
            access[msg.sender].push(addressUser(_add, name));
            prevownership[msg.sender][_add] = true;
        }
    }
    function addConnectionString(string memory _url) public {
        connectionString[msg.sender] = _url;
    }

    function viewConnectionString(
        address user
    ) public view returns (string memory) {
        if (ownership[user][msg.sender]) {
            return connectionString[user];
        } else {
            revert("you are not allowed to view ");
        }
    }
}
