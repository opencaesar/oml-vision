import { combineByCategory } from "./diagramUtils";

test('combines an array of entries "<key>#<value>"into a Record of {"<uniqueKey>": [...<associatedValues>]}', () => {
    const input = ["1#one", "1#uno", "2#deux", "2#zwei"]
    const result = combineByCategory(input) // using default delimiter '#'
    expect(result["1"]).toContain("one")
    expect(result["1"]).toContain("uno")
    expect(result["2"]).toContain("zwei")
    expect(result["2"]).toContain("deux")
});