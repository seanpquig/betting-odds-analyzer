describe("generateOutcomePlotItems function", function() {

    it("handles empty betData", function() {
        var betData = [];
        var plotItems = generateOutcomePlotItems(betData);
        expect(plotItems).toEqual( [] );
    });

    it("handles a single bet", function() {
        var betData = [{wager: 100, probability: 0.2079, profit: 381}];
        var plotItems = generateOutcomePlotItems(betData);
        expect(plotItems.length).toEqual(2);
        expect(plotItems[0]).toEqual({profit: 381, probability: '20.79', outcome: "gain"});
        expect(plotItems[1]).toEqual({profit: -100, probability: '79.21', outcome: "loss"});
    });

    it("handles two non-coditional bets", function() {
        var betData = [
            {wager: 100, probability: 0.2079, profit: 381},
            {wager: 200, probability: 0.7647, profit: 61.54}
        ];
        var plotItems = generateOutcomePlotItems(betData);
        expect(plotItems.length).toEqual(4);
        expect(plotItems[0]).toEqual({profit: 442.54, probability: "15.90", outcome: "gain"});
        expect(plotItems[1]).toEqual({profit: 181, probability: "4.89", outcome: "gain"});
        expect(plotItems[2]).toEqual({profit: -38.46, probability: "60.57", outcome: "loss"});
        expect(plotItems[3]).toEqual({profit: -300, probability: "18.64", outcome: "loss"});
    });

});
