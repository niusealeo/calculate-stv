var CandidateNode = require('../src/candidate.js');
var assert = require('chai').assert;

describe('CandidateNode', function() {
    var alpha = { name : 'Alpha', id : 1 },
        beta = { name : 'Beta', id : 2 },
        gamma = { name : 'Gamma', id : 3 };

    describe('constructor', function() {
        it('should store the candidate object', function() {
            var cand1 = new CandidateNode(alpha);
            assert.deepEqual(cand1.cand, alpha);
        });
        it('should default to a zero count', function() {
            var cand = new CandidateNode(alpha);
            assert(cand.count === 0);
        });
    });

    describe('CandidateNode.prototype.addChild', function() {
        var cand = new CandidateNode(alpha, 12);
        cand.addChild(beta);
        cand.addChild(gamma, 11);
        it('Should not change the parent candidate', function() {
            assert.deepEqual(cand.cand, alpha);
        });
        it('Should default the child\'s count to zero', function() {
            assert(cand.children[beta.id].count === 0);
        });
        it('should use the count given, if one is provided for the child', function() {
            assert(cand.children[gamma.id].count === 11);
        });
    });

    describe('CandidateNode.prototype.add', function() {

        it('should add the counts of two nodes', function() {
            var cand1 = new CandidateNode(alpha, 12);
            var cand2 = new CandidateNode(alpha, 18);

            assert(cand1.add(cand2).count === 30);
        });

        it('should add the counts of corresponding children', function() {
            var cand1 = new CandidateNode(alpha, 12);
            var cand2 = new CandidateNode(alpha, 18);

            cand1.addChild(beta, 6);
            cand2.addChild(beta, 4);
            var sum = cand1.add(cand2);
            assert.deepEqual(sum.children[beta.id].cand, beta,
                            'Child candidate incorrect');
            assert(sum.children[beta.id].count === 10,
                   'Child count is incorrect');
        });

        it('should just use the current nodes child if the other node does not have ' +
           'a corresponding child', function() {
               var cand1 = new CandidateNode(alpha, 12);
               var cand2 = new CandidateNode(alpha, 18);
               cand1.addChild(beta, 6);
               var sum = cand1.add(cand2);
               assert.deepEqual(sum.children[beta.id].cand, beta,
                               'The candidate is wrong');
               assert(sum.children[beta.id].count === 6,
                      'The count is wrong');
           });
        it('should just use the other nodes child if the current node does not have ' +
           'a corresponding child', function() {
               var cand1 = new CandidateNode(alpha, 12);
               var cand2 = new CandidateNode(alpha, 18);
               cand2.addChild(beta, 7);
               var sum = cand1.add(cand2);
               assert.deepEqual(sum.children[beta.id].cand, beta,
                                'The candidate is wrong');
               assert(sum.children[beta.id].count === 7);
           });
    });

    describe('CandidateNode.prototype.multiply', function() {
        it('should scale the base node\'s count', function() {
            var cand1 = new CandidateNode(alpha, 12);
            assert(cand1.multiply(2).count === 24);
        });
        it('should scale the children node\'s counts', function() {
            var cand1 = new CandidateNode(alpha, 12);
            cand1.addChild(beta, 14);
            assert(cand1.multiply(3).children[beta.id].count === 3 * 14);
        });
    });

});
