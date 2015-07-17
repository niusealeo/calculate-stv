module.exports = CandidateNode;

/**
 * CandidateNode
 * @constructor
 * Candidate nodes are part of a tree structure for storing the state of an STV election.
 * Each node has a count of votes and a candidate associated with it. They also have a
 * dictionary of child nodes, each of which represent the counts of voters who chose a
 * particular candidate as their next choice.
 *
 * A particular voting pattern, then, is a path down a candidate tree.
 *
 * With this structure, when we need to eliminate a candidate, we just redistribute that
 * candidate's children nodes to the correspondings trees and merge those trees.
 *
 * @param {Candidate Object} cand a candidate object with a 'name' and 'id' property
 * @param {number} count the count of votes for that node
 */
function CandidateNode(cand, count) {
  // A node in the candidate tree structure.
  this.cand = cand;
  this.count = count || 0;
  this.children = {};
}

/**
 * to string method
 */
CandidateNode.prototype.toString = function() {
  return '[ ' + this.cand.name + ': ' + this.count + ' ]';
};

/**
 * 
 */
CandidateNode.prototype.addChild = function(candidate, count) {
  // Adds a child to the node
  var key = candidate.id;
  var newNode = new CandidateNode(candidate, count || 0);
  this.children[key] = newNode;
};

/**
 *
 */
CandidateNode.prototype.add = function(other) {
  // Adds two candidate nodes and their children. Used to merge trees.
  var newNode = new CandidateNode(this.cand);

  // 1. Add the counts of the root nodes
  newNode.count = this.count + other.count;

  // 2. Collect the union of the keys in the two nodes
  var keys = Object.keys(this.children);
  var additionalKeys = Object.keys(other.children);
  keys = keys.concat(additionalKeys.filter(function(item) {
    return keys.indexOf(item) < 0;
    }));

  // 3. Add the counts of the corresponding children
  for (var i = 0; i < keys.length; i++)
      newNode.children[keys[i]] = addTheseChildren(this.children, other.children, keys[i]);

  // 4. Return the new node
  return newNode;
};

function addTheseChildren(a, b, key) {
    var aHas = a.hasOwnProperty(key),
        bHas = b.hasOwnProperty(key);
    if (aHas && bHas) return a[key].add(b[key]);
    else if (aHas) return a[key];
    else return b[key];
}

CandidateNode.prototype.multiply = function(scale) {
  // Multiplies the count of a nodes and it's children by a scale factor.
  var newNode = new CandidateNode(this.cand, this.count);
  newNode.count = scale * newNode.count;
  var keys = Object.keys(this.children);
  for (var i = 0; i < keys.length; i++)
    newNode.children[keys[i]] = this.children[keys[i]].multiply(scale);
  return newNode;
};

