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
}
