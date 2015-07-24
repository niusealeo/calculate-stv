var CandidateNode = require('./candidate'),
    R = require('ramda');

module.exports = calculate;

/**
 * @function calculate does the caclulations for an election
 * @param {array} ballots an array of ballot data
 * @param {integer} seats the number of availible seats
 */
function calculate(ballots, seats) {
    var tree = createElectionTree(ballots),
        finalists = {},
        messages = [],
        curr_threshold,
        key,
        new_finalist,
        had_surplus;

    while (Object.keys(finalists).length < seats) {
        console.log('tree: ', tree);
        // 1. Calculate threshold
        curr_threshold = threshold(tree, seats);
        console.log('Threshold: ', curr_threshold);
        // 2. Check for finalists
        new_finalist = false;
        for (key in tree)
            if (tree[key].count >= curr_threshold &&
               !(key in finalists)) {
                new_finalist = true;
                finalists[key] = tree[key].cand;
            }
        if (new_finalist)
            continue;
        // 3. Check for surplus
        had_surplus = false;
        while(is_surplus(tree, curr_threshold)) {
            had_surplus = true;
            for (key in tree)
                if (tree[key].count > curr_threshold)
                    surplus(key, tree, curr_threshold, finalists);
            // Update threshold for next iteration of while loop
            curr_threshold = threshold(tree, seats);
        }
        if (had_surplus) {
            messages.push('Surplus!');
            continue;
        }
        // 4. Eliminate the lowest rankings candidate
        var lowest_ranked = Object.keys(tree)[0];
        for (key in tree)
            if (tree[key].count < tree[lowest_ranked].count)
                lowest_ranked = key;
        console.log('Eliminate: ', tree[lowest_ranked].cand.name);
        eliminate(lowest_ranked, tree, finalists);
        messages.push('Eliminated');
    }
    return { finalists : finalists,
             messages : messages };
}

function is_surplus(tree, threshold) {
    function has_surplus(key) { return tree[key].count > threshold; }
    function or(a, b) { return a || b; }
    return Object.keys(tree).map(has_surplus).reduce(or);
}

function threshold(tree, seats) {
    function count(key) { return tree[key].count; }
    function sum(a, b) { return a + b; }
    var num_ballots = Object.keys().map(count).reduce(sum);
    return ( num_ballots / (seats + 1) ) + 1;
}

function eliminate(key, tree, finalists) {
    var branch = tree[key];
    delete tree[key];
    var children = branch.children;
    distribute(children, tree, finalists);
}

/**
 * @function surplus redistributes the surplus votes of a candidate
 * @param {integer} key the key of the candidate in the tree object
 * @param {Candidate Tree} tree the current candidate tree
 * @param {number} curr_threshold the current winning threshold
 */
function surplus(key, tree, curr_threshold, finalists) {
    var total_votes = tree[key].count,
        surplus_votes = total_votes - curr_threshold,
        surplus_prop = surplus_votes / total_votes,
        non_surplus_prop = 1 - surplus_prop;

    tree[key] = tree[key].multiply(non_surplus_prop);

    var extra_children = {};
    for (var i in tree[key].children)
        extra_children[i] = tree[key].children[i].multiply(surplus_prop);

    distribute(extra_children, tree, finalists);
}

/**
 * @function distribute generic function to redistribute votes
 * @param {array of CandidateNodes} tree_list nodes to distribute
 * @param {Candidate Tree} tree the current candidate tree
 */
function distribute(tree_list, tree, finalists) {
    for (var key in tree_list) {
        /* If the tree to merge into does not exist or is a finalists, merge
           the children. */
        if (Object.keys(tree).indexOf(key) === -1 ||
            Object.keys(finalists).indexOf(key) !== -1)
            distribute(tree_list[key].children, tree, finalists);
        else
            tree[key] = tree[key].add(tree_list[key]);
    }
}

/**
 * @function createElectionTree Creates a tree structure to represent the election
 *   state.
 * @param {array} ballots an array of ballot data
 * @param {function} accessor a function that takes an element of the ballots
 *   array and returns a list of candidate objects, in the order of preference
 * @returns A tree of candidate nodes.
 */
function createElectionTree(ballots) {
    // Create the trees by adding each ballot to it, starting with empty object
    var trees = ballots.reduce(addBallot, {});

    function addBallot(tree, ballot) {
        var level = tree;
        ballot.forEach(addVote);
        return tree;

        function addVote(cand) {
            if (!hasCandidateNode(level, cand))
                level[cand.id] = new CandidateNode(cand);
            level[cand.id].count += 1;
            level = level[cand.id].children;
        }
    }

    return trees;
}

function hasCandidateNode(object, cand) {
    return object.hasOwnProperty(cand.id);
}




