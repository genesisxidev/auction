// // SPDX-License-Identifier: MIT
// pragma solidity ^0.8.20;

// import "@openzeppelin/contracts/token/common/ERC2981.sol";
// import "@openzeppelin/contracts/access/Ownable.sol";
// import "@openzeppelin/contracts/utils/Strings.sol";
// import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
// import "./ERC721A.sol";

// contract NFTAuction1 is ERC721A, Ownable, ReentrancyGuard {
//     using Strings for uint256; // Use the Strings library for uint256
//     uint256 public nextTokenId = 1;

//     string public baseURI;
//     string public baseExtension = ".json";
//     uint256 public constant MAX_SUPPLY = 10000;
//     mapping(uint256 => string) private tokenURIs;
//     bool public readyToMint = true;
//     //mapping(address => uint256[]) public balances;

//     struct Auction {
//         uint256 tokenId;
//         uint256 startTime;
//         uint256 endTime;
//         uint256 basePrice;
//         uint256 highestBid;
//         address highestBidder;
//         address previousBidder;
//         address[] bidders;
//         status status;
//     }
//     struct Bid{
//         address bidder;
//         uint256 amount;
//     }

//     enum status {
//         idle,
//         live,
//         Ended,
//         completed
//     }

//     mapping(uint256 => Auction) public auctions; //tokenId=>auction
//     mapping(uint256 => mapping(address => uint256[])) public bids; //auctionId=>bidder=>bids
//     mapping(uint256 => Auction) public currentAuctions; // identifier is tokenId and always be 10 auctions

//     event AuctionCreated(
//         uint256 tokenId,
//         uint256 startTime,
//         uint256 endTime,
//         uint256 basePrice
//     );
//     event BidPlaced(uint256 tokenId, address bidder, uint256 amount);
//     event AuctionEnded(uint256 tokenId);
//     constructor(
//         string memory _initBaseURI
//     ) ERC721A("MyToken", "MTK") Ownable(msg.sender) ReentrancyGuard() {
//         baseURI = _initBaseURI;
//     }

//     function createAuction(
//         uint256 tokenId,
//         uint256 startTime,
//         uint256 endTime,
//         uint256 basePrice
//     ) public onlyOwner {
//         require(tokenId<nextTokenId,"nft does not exist");
//         require(
//             checkTimestamps(startTime, endTime),
//             "Start time must be less than end time"
//         );
//         require(
//             startTime > block.timestamp,
//             "Start time must be in the future"
//         );
//         require(
//             tokenId <= nextTokenId,
//             "Token ID must be less than or equal to the next token ID"
//         );
//         require(basePrice > 0, "Base price must be greater than 0");
//         require(
//             currentAuctions[tokenId].tokenId == 0 &&
//                 auctions[tokenId].tokenId == 0,
//             "Auction is already created or completed"
//         );

//         Auction memory newAuction = Auction({
//             tokenId: tokenId,
//             startTime: startTime,
//             endTime: endTime,
//             basePrice: basePrice,
//             highestBid: 0,
//             highestBidder: address(0),
//             previousBidder: address(0),
//             bidders: new address[](0),
//             status: status.live
//         });

//         auctions[tokenId] = newAuction;
//         currentAuctions[tokenId] = newAuction;
//         emit AuctionCreated(tokenId, startTime, endTime, basePrice);
//     }
//     function bid(uint256 tokenId, uint256 amount) public payable nonReentrant {  
//         require(
//             currentAuctions[tokenId].status == status.live,
//             "Auction is not live"
//         );
//         require(
//             block.timestamp >= currentAuctions[tokenId].startTime &&
//                 block.timestamp <= currentAuctions[tokenId].endTime,
//             "Auction is not live"
//         );
//         require(
//             amount > currentAuctions[tokenId].highestBid,
//             "Bid must be higher than the current highest bid"
//         );
//         require(msg.value == amount, "invlaid ether sent");
//         //transfer previous bidder
//         payable(currentAuctions[tokenId].previousBidder).transfer(
//             currentAuctions[tokenId].highestBid
//         );
//         bids[tokenId][msg.sender].push(amount);
//         currentAuctions[tokenId].bidders.push(msg.sender);
//         currentAuctions[tokenId].highestBid = amount;
//         currentAuctions[tokenId].highestBidder = msg.sender;
//         currentAuctions[tokenId].previousBidder = msg.sender;
//         auctions[tokenId].highestBid = amount;
//         auctions[tokenId].highestBidder = msg.sender;
//         auctions[tokenId].bidders.push(msg.sender);
//         auctions[tokenId].previousBidder = msg.sender;
//         emit BidPlaced(tokenId, msg.sender, amount);
//     }
//     function endAuction(uint256 tokenId) public onlyOwner {
//         require(
//             currentAuctions[tokenId].status == status.live,
//             "Auction is not live"
//         );
//         require(
//             block.timestamp > currentAuctions[tokenId].endTime,
//             "Auction time is not up yet "
//         );

//         currentAuctions[tokenId].status = status.Ended;
//         auctions[tokenId].status = status.Ended;

//         //check if all auctions are ended
//         if (checkIfAllAuctionsAreEnded()) {
//             //transfer NFTs

//             require(transferNFTs(), "Failed to transfer NFTs");
//             //reset currentAuctions
//             require(resetCurrentAuctions(), "Failed to reset currentAuctions");
//         }

//         emit AuctionEnded(tokenId);
//     }

//     function transferNFTs() internal onlyOwner returns (bool) {
//         for (uint256 i = nextTokenId - 11; i < nextTokenId - 1; i++) {
//             safeTransferFrom(
//                 address(this),
//                 currentAuctions[i].highestBidder,
//                 i
//             );
//         }
//         return true;
//     }
//     function checkIfAllAuctionsAreEnded() internal view returns (bool) {
//         for (uint256 i = nextTokenId - 11; i < nextTokenId - 1; i++) {
//             if (currentAuctions[i].status != status.Ended) {
//                 return false;
//             }
//         }
//         return true;
//     }
//     function resetCurrentAuctions() internal returns (bool) {
//         for (uint256 i = nextTokenId - 11; i < nextTokenId - 1; i++) {
//             currentAuctions[i] = Auction(
//                 0,
//                 0,
//                 0,
//                 0,
//                 0,
//                 address(0),
//                 address(0),
//                 new address[](0),
//                 status.idle
//             );
//             auctions[i].status = status.completed;
//         }
//         return true;
//     }
//     function checkTimestamps(
//         uint256 startTime,
//         uint256 endTime
//     ) public pure returns (bool) {
//         return startTime < endTime;
//     }

//     function _setTokenURI(string[] memory _tokenURI) internal virtual {
//         for (uint256 i = 0; i < 10; ) {
//             nextTokenId++;
//             //balances[msg.sender].push(nextTokenId);
//             tokenURIs[nextTokenId] = _tokenURI[i];
//             unchecked {
//                 i++;
//             }
//         }
//     }

//     function ownerMint(string[] memory uri) public onlyOwner {
//         require(readyToMint, "Not ready to mint,auctions in progress");
//         _safeMint(address(this), 10);
//         _setTokenURI(uri);
//         nextTokenId += 10;
//         readyToMint = false;
//     }

//     function _baseURI() internal view virtual override returns (string memory) {
//         return baseURI;
//     }

//     function tokenURI(
//         uint256[] memory tokenIds
//     ) public view returns (string[] memory) {
//         string[] memory uris = new string[](tokenIds.length);
//         for (uint i = 0; i < tokenIds.length; i++) {
//             require(
//                 _exists(tokenIds[i]),
//                 "ERC721Metadata: URI query for nonexistent token"
//             );

//             string memory currentBaseURI = _baseURI();
//             uris[i] = bytes(currentBaseURI).length > 0
//                 ? string(
//                     abi.encodePacked(
//                         currentBaseURI,
//                         tokenURIs[tokenIds[i]],
//                         baseExtension
//                     )
//                 )
//                 : "";
//         }
//         return uris;
//     }
//     function withdraw() external onlyOwner nonReentrant {
//         require(readyToMint, "satisfy all auctions before withdrawing");
//         uint256 balance = address(this).balance;
//         require(balance > 0, "No ETH to withdraw");
//         payable(msg.sender).transfer(balance);
//     }

//     function getUpcomingAuctions() public view returns (Auction[] memory) {
//         uint256 count = 0;
//         for (uint256 i = 1; i <= nextTokenId; i++) {
//             if (auctions[i].startTime > block.timestamp) {
//                 count++;
//             }
//         }

//         Auction[] memory upcomingAuctions = new Auction[](count);
//         uint256 index = 0;
//         for (uint256 i = 1; i <= nextTokenId; i++) {
//             if (auctions[i].startTime > block.timestamp) {
//                 upcomingAuctions[index] = auctions[i];
//                 index++;
//             }
//         }

//         return upcomingAuctions;
//     }
//     function getLiveAuctions() public view returns (Auction[] memory) {
//         uint256 count = 0;
//         for (uint256 i = 1; i <= nextTokenId; i++) {
//             if (auctions[i].status == status.live) {
//                 count++;
//             }
//         }

//         Auction[] memory liveAuctions = new Auction[](count);
//         uint256 index = 0;
//         for (uint256 i = 1; i <= nextTokenId; i++) {
//             if (auctions[i].status == status.live) {
//                 liveAuctions[index] = auctions[i];
//                 index++;
//             }
//         }

//         return liveAuctions;
//     }


//     function getBids(uint256 tokenId) public view returns (Bid[] memory) {
//         require(tokenId <= nextTokenId, "Token ID does not exist");
        
//         // Get auction details
//         Auction storage auction = auctions[tokenId];
//         address[] memory bidders = auction.bidders;
        
//         // Calculate total number of bids
//         uint256 totalBids = 0;
//         for (uint256 i = 0; i < bidders.length; i++) {
//             totalBids += bids[tokenId][bidders[i]].length;
//         }
        
//         // Create array of all bids
//         Bid[] memory allBids = new Bid[](totalBids);
//         uint256 currentIndex = 0;
        
//         // Populate all bids
//         for (uint256 i = 0; i < bidders.length; i++) {
//             uint256[] memory bidderBids = bids[tokenId][bidders[i]];
//             for (uint256 j = 0; j < bidderBids.length; j++) {
//                 allBids[currentIndex] = Bid({
//                     bidder: bidders[i],
//                     amount: bidderBids[j]
//                 });
//                 currentIndex++;
//             }
//         }
        
//         return allBids;
//     }
//     function getEndedAuctions() public view returns (Auction[] memory) {
//         uint256 count = 0;
//         for (uint256 i = 1; i <= nextTokenId; i++) {
//             if (
//                 auctions[i].status == status.Ended ||
//                 auctions[i].status == status.completed
//             ) {
//                 count++;
//             }
//         }

//         Auction[] memory endedAuctions = new Auction[](count);
//         uint256 index = 0;
//         for (uint256 i = 1; i <= nextTokenId; i++) {
//             if (
//                 auctions[i].status == status.Ended ||
//                 auctions[i].status == status.completed
//             ) {
//                 endedAuctions[index] = auctions[i];
//                 index++;
//             }
//         }

//         return endedAuctions;
//     }
// }
