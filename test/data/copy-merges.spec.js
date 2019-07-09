const expect = require('chai').expect;
const InspireTree = require('../../' + (process.env.DIST ? 'dist' : 'build') + '/inspire-tree');

describe('Modification', function() {
    let tree1;
    let tree2;

    before(function() {
        tree1 = new InspireTree({
            data: [{
                text: 'A',
                id: 1
            }, {
                text: 'B',
                id: 2,
                children: [{
                    text: 'B1',
                    id: 20
                }]
            }]
        });

        tree2 = new InspireTree({
            data: []
        });
    });

    it('throws error if destination tree isn\'t recognized', function() {
        expect(tree1.nodes().copy).to.throw(Error);
    });

    it('copies all nodes to a new tree', function() {
        expect(tree2.nodes()).to.have.length(0);

        tree1.nodes().copy(tree2);
        expect(tree2.nodes()).to.have.length(2);

        tree2.removeAll();
    });

    it('copies given nodes to a new tree', function() {
        expect(tree2.nodes()).to.have.length(0);

        tree1.nodes().copy(tree2);
        expect(tree2.nodes()).to.have.length(2);

        tree2.removeAll();
    });

    it('copies selected node to a new tree', function() {
        expect(tree2.nodes()).to.have.length(0);

        const node = tree1.node(1);
        node.select();
        tree1.selected().copy(tree2);

        expect(tree2.nodes()).to.have.length(1);
        expect(tree2.nodes()[0].id).to.equal(1);

        tree2.removeAll();
    });

    it('copies specific node to a new tree', function() {
        expect(tree2.nodes()).to.have.length(0);

        const node = tree1.node(1);
        node.copy(tree2);

        expect(tree2.nodes()).to.have.length(1);
        expect(tree2.nodes()[0].id).to.equal(1);

        tree2.removeAll();
    });

    it('copies child node to a new tree', function() {
        expect(tree2.nodes()).to.have.length(0);

        const node = tree1.node(20);
        node.copy(tree2);

        expect(tree2.nodes()).to.have.length(1);
        expect(tree2.nodes()[0].id).to.equal(20);

        tree2.removeAll();
    });

    it('copies child node and its hierarchy to a new tree', function() {
        expect(tree2.nodes()).to.have.length(0);

        const node = tree1.node(20);
        node.copy(tree2, true);

        expect(tree2.nodes()).to.have.length(1);
        expect(tree2.nodes()[0].id).to.equal(2);

        tree2.removeAll();
    });

    it('merges new nodes on copy', function() {
        // Move all nodes over
        tree1.nodes().copy(tree2);

        // Check original child count
        expect(tree1.node(2).children).to.have.length(1);

        // Push a new child to the copied data
        const parent = tree2.node(2);
        parent.addChild({
            text: 'New'
        });

        // Check new child count
        expect(tree2.node(2).children).to.have.length(2);

        // Re-copy the node to the original tree
        parent.copy(tree1, true);
        expect(tree1.node(2).children).to.have.length(2);

        tree2.removeAll();
    });

    it('shows child node when merged back into source via api', function() {
        const node = tree1.node(20);

        // Remove source copy
        node.softRemove();
        expect(node.removed()).to.be.true;

        // Move it
        node.copy(tree2, true);

        // Check new copy
        const clone = tree2.node(20);
        expect(clone.removed()).to.be.false;

        // Move back
        clone.copy(tree1, true);

        // Check source
        expect(node.removed()).to.be.false;

        tree2.removeAll();
    });

    it('shows child node when merged back into source by selection', function() {
        const node = tree1.node(20);

        // Remove source copy
        node.softRemove();
        expect(node.removed()).to.be.true;

        // Move it
        node.copy(tree2, true);

        // Check new copy
        const clone = tree2.node(20);
        expect(clone.removed()).to.be.false;

        // Re-select in destination
        clone.select();
        const selected = tree2.selected();

        // Move back
        selected.copy(tree1, true);

        // Check source
        expect(node.removed()).to.be.false;

        tree2.removeAll();
    });

    it('only shows nodes merged back in', function() {
        // Move all to one tree
        tree1.nodes().copy(tree2);
        tree1.nodes().softRemove();

        const node = tree2.node(20);
        node.copy(tree1, true);

        expect(tree1.nodes()[0].removed()).to.be.true;
        expect(tree1.nodes()[1].removed()).to.be.false;
        expect(tree1.nodes()[1].children[0].removed()).to.be.false;
        expect(tree1.nodes()[1].children[1].removed()).to.be.true;

        tree2.removeAll();
    });

    it('includes state, and retains custom properties for a single node', function() {
        // Move all to one tree
        const node1 = tree1.node(1);
        node1.state('example', true);
        node1.select();

        expect(node1.selected()).to.be.true;

        node1.copy(tree2, false, true);

        const node2 = tree2.node(1);
        expect(node2.state('example')).to.be.true;
        expect(node2.selected()).to.be.true;

        tree2.removeAll();
    });

    it('includes state, and retains custom properties for all nodes', function() {
        // Move all to one tree
        tree1.nodes().state('example', true).copy(tree2, false, true);

        const node1 = tree2.node(1);
        expect(node1.state('example')).to.be.true;

        const node2 = tree2.node(2);
        expect(node2.state('example')).to.be.true;

        tree2.removeAll();
    });
});
