/**
  __STV Election Tabulation__

  Each ballot is stored as a list of candidate ids, ordered by the rank the
  voter has assigned the candidate. Instead of working with individual ballots
  during calculations, this algorithm creates a tree structure that represents
  possible ways of voting and how many people voted in that particular way.

  Each node will have a count and candidate associated with it. It will also
  have a dictionary of child nodes, each of which represent the count of voters
  who chose a particular candidate as their next choice.

  Thus, when we need to eliminate a candidate, we just redistriubte that
  candidate's children nodes to the corresponding trees, and merge those.
*/



function Candidate(name, id) {
  this.name = name;
  this.id = id;
}


function createCandidateTree(ballots, candidates) {
  // Make values in cadidates object all instances of Candidate
  var ids = Object.keys(candidates);
  for (var i = 0; i < ids.length; i++)
    candidates[ids[i]] = new Candidate(candidates[ids[i]], ids[i]);
  
  var trees = {}; // this will be the output.

  for (i = 0; i < ballots.length; i++) {
    // Create root tree if necessary
    if (Object.keys(trees).indexOf(ballots[i][0]) === -1)
      trees[ballots[i][0]] = new CandidateNode(candidates[ballots[i][0]]);
    
    var node = trees[ballots[i][0]];


    
    for (var j = 0; j < ballots[i].length; j++) {
      // Add one to current node
      node.count += 1;
      // if there is no next vote, break
      if (j === ballots[i].length - 1)
	break;
      else {
	var nextID = ballots[i][j+1];
	if (Object.keys(node.children).indexOf(nextID) === -1)
	  node.addChild(candidates[nextID]);
	node = node.children[nextID];
      }
    }
  }
  return trees;
}

function countBallots(trees, finalists) {
  // Returns the total number of ballots represented in the given set of
  // candidate trees.
  var numBallots = 0;
  for (var key in trees)
    numBallots += trees[key].count;
  for (var i = 0; i < finalists.length; i++)
    numBallots += finalists[i].count;
  return numBallots;
}

function distribute(tree_list, trees) {
  for (var key in tree_list) {
    // If the tree we need to merge does not exist, distribute the children
    if (Object.keys(trees).indexOf(key) === -1)
      distribute(tree_list[key].children, trees);
    else
      trees[key] = trees[key].add(tree_list[key]);
  }
}

function surplus(key, trees, quota) {
  // Redistributes the extra votes from a candidate who has more votes than
  // needed for the qouta.
  var total_votes = trees[key].count;
  var surplus_votes = total_votes - quota;
  var surplus_prop = surplus_votes / total_votes;
  var non_surplus_prop = 1 - surplus_prop;

  trees[key] = trees[key].multiply(non_surplus_prop);

  var extra_children = {};
  for (var i in trees[key].children)
    extra_children[i] = trees[key].children[i].multiply(surplus_prop);

  distribute(extra_children, trees);
}

function eliminate(key, trees) {
  // Eliminates a given candidate node and then redistributes their votes.
  var tree = trees[key];
  delete trees[key];
  children = tree.children;
  distribute(children, trees);
}


exports.calculateSTV = function(candidates, ballots, seats) {
  // 1. Create the trees
  var trees = createCandidateTree(ballots, candidates);

  // 2. STV Rounds
  var finalists = [];
  var messages = [];

  var i = 0;
  // report initial conditions
  messages.push(STVRound(trees, i, 'No rounds yet'));
  i++;

  while (Object.keys(trees).length > 0) {
    // This really is a while loop...
    var num_ballots = countBallots(trees, finalists);
    var quota = Math.floor( num_ballots / (seats + 1) + 1 );

    // First, check for surplus
    var surplus_cand = [];
    for (var key in trees)
      if (trees[key].count >= quota) {
	surplus_cand.push(trees[key].cand.name);
	// Redistribute the surplus votes
	surplus(key, trees, quota);
	// Add the candidate to the finalists
	finalists.push(trees[key]);
	// Remove the candidate from the trees
	delete trees[key];
      }
    if (surplus_cand.length > 0) {
      console.log('surplus!' + surplus_cand.join());
      messages.push(STVRound(trees, finalists, i,
			     "Surplus: " + surplus_cand.join(', ')));
      i++;
      continue;
    }

    // If no surplus, eliminate the candidate with the fewest first place votes
    var running_min_key = Object.keys(trees)[0];
    for ( key in trees)
      if (trees[key].count < trees[running_min_key].count)
	running_min_key = key;
    var eliminated_cand = trees[running_min_key].cand.name;
    eliminate(running_min_key, trees);
    messages.push(STVRound(trees, finalists, i,
			   "Eliminating: " + eliminated_cand));


    i++;
  }

  return {'messages': messages};
};

function STVRound(trees, finalists, iteration, message) {
  return { 'iteration' : iteration,
	   'message' : message,
	   'status' : statusCheck(trees, finalists)};
}


function statusCheck(trees, finalists) {
  var output = [];
  // Record the current candidates
  for (var key in trees) {
    if (trees[key] !== null) {
      output.push({'id': trees[key].cand.id,
		   'name': trees[key].cand.name,
		   'count': trees[key].count});
    }
  }
  // Record the current victors
  for (var i = 0; i < finalists.length; i++) {
      output.push({'id': finalists[i].cand.id,
		   'name': finalists[i].cand.name,
		   'count': finalists[i].count});
  }
  // sort by id
  output.sort(function (a,b) {
    return a.id - b.id;
  });
  return output;
}
