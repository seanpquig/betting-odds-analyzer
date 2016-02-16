describe("generateOutcomePlotItems function", function() {

    it("handles empty betData", function() {
        var betData = [];
        var plotItems = generateOutcomePlotItems(betData);
        expect(plotItems).toEqual( [] );
    });

    it("handles a single bet", function() {
        var betData = [{wager: 100, probability: 0.2817, profit: 255, athleteName: "Michael Bisping", fightId: "994850679"}];
        var plotItems = generateOutcomePlotItems(betData);
        expect(plotItems.length).toEqual(2);
        expect(plotItems[0]).toEqual({profit: 255.00, probability: 28.17, outcome: "gain"});
        expect(plotItems[1]).toEqual({profit: -100.00, probability: 71.83, outcome: "loss"});
    });

    it("handles two non-conditional bets", function() {
        var betData = [
            {wager: 100, probability: 0.2079, profit: 381, athleteName: "RDA", fightId: "994850679"},
            {wager: 200, probability: 0.7647, profit: 61.54, athleteName: "Gegard Mousasi", fightId: "1896327589"}
        ];
        var plotItems = generateOutcomePlotItems(betData);
        expect(plotItems.length).toEqual(4);
        expect(plotItems[0]).toEqual({profit: 442.54, probability: 15.90, outcome: "gain"});
        expect(plotItems[1]).toEqual({profit: 181.00, probability: 4.89, outcome: "gain"});
        expect(plotItems[2]).toEqual({profit: -38.46, probability: 60.57, outcome: "loss"});
        expect(plotItems[3]).toEqual({profit: -300.00, probability: 18.64, outcome: "loss"});
    });

    it("handles two conditional bets", function() {
        var betData = [
            {wager: 300, probability: 0.7647, profit: 92.31, athleteName: "Anderson Silva", fightId: "994850679"},
            {wager: 100, probability: 0.2817, profit: 255, athleteName: "Michael Bisping", fightId: "994850679"}
        ];
        var plotItems = generateOutcomePlotItems(betData);
        expect(plotItems.length).toEqual(2);
        expect(plotItems[0]).toEqual({profit: -7.69, probability: 76.47, outcome: "loss"});
        expect(plotItems[1]).toEqual({profit: -45.00, probability: 23.53, outcome: "loss"});
    });

});
