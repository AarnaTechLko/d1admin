'use client';
import React from 'react';
import { Attribute, Category } from '@/app/types/types';

interface PitcherComponentProps {
  categories: Category[];
  evaluationResponses: Record<string, Record<string, string | number>>;
  onScoreChange: (
    categoryId: string,
    attributeId: string,
    value: string
  ) => void;
  position?: string | number;
}

const PitcherComponent: React.FC<PitcherComponentProps> = ({
  categories,
  evaluationResponses,
  onScoreChange,
  position,
}) => {
  const innings = position == 21 ? 9 : 7;

  const handleInningScoreChange = (
    categoryId: string,
    attributeId: string,
    inning: number,
    score: string
  ) => {
    const currentScores = (
      (evaluationResponses[categoryId]?.[attributeId] as string) || ''
    ).split(',');
    const scores = Array(innings)
      .fill('')
      .map((_, i) => currentScores[i] || '');
    scores[inning] = score;
    const finalValue = scores.join(',');

    // Update the attribute value
    onScoreChange(categoryId, attributeId, finalValue);

    // Calculate and update avgScore
    const category = categories.find(c => String(c.id) === categoryId);
    const avgScoreAttr = category?.attributes?.find(
      (attr: Attribute) => attr.name === 'avgScore'
    );

    if (avgScoreAttr) {
      const allValues: number[] = [];
      const categoryData = evaluationResponses[categoryId] || {};

      const updatedCategoryData = {
        ...categoryData,
        [attributeId]: finalValue,
      };

      Object.entries(updatedCategoryData)
        .filter(([attrId]) => attrId !== String(avgScoreAttr.id))
        .forEach(([, val]) => {
          if (typeof val === 'string' && val.includes(',')) {
            const scores = val
              .split(',')
              .map(v => Number(v))
              .filter(v => !isNaN(v) && v > 0);
            allValues.push(...scores);
          }
        });

      const average =
        allValues.length > 0
          ? (allValues.reduce((a, b) => a + b, 0) / allValues.length).toFixed(2)
          : '0.00';

      onScoreChange(categoryId, String(avgScoreAttr.id), average);
    }
  };

  const getInningScore = (
    categoryId: string,
    attributeId: string,
    inning: number
  ) => {
    const scores = (
      (evaluationResponses[categoryId]?.[attributeId] as string) || ''
    ).split(',');
    return scores[inning] || '';
  };

  const calculateStats = (categoryId: string) => {
    const categoryData = evaluationResponses[categoryId] || {};

    const getTotal = (attributeName: string) => {
      const attr = categories
        ?.find(c => String(c.id) === categoryId)
        ?.attributes?.find(a => a.name === attributeName);

      if (!attr) return 0;
      const values = ((categoryData[String(attr.id)] as string) || '').split(',');
      return values.reduce((sum, val) => sum + (parseInt(val) || 0), 0);
    };

    const totalBalls = getTotal('Balls');
    const totalStrikes = getTotal('Strikes');
    const totalHits = getTotal('Hits');
    const firstPitchStrikes = getTotal('1st Pitch Strikes');
    const battersFaced = getTotal('Batters Faced');
    const walks = getTotal('Walks');
    const strikeouts = getTotal('Strikeouts');
    const homeRuns = getTotal('Home Runs');
    const earnedRuns = getTotal('Earned Runs');

    const inningsPitched = innings;

    return {
      firstPitchStrikePercent:
        battersFaced > 0
          ? ((firstPitchStrikes / battersFaced) * 100).toFixed(1)
          : '0.0',
      hitsVsInning: (totalHits / innings).toFixed(2),
      totalPitchCount: totalBalls + totalStrikes,
      ballStrikeRatio:
        totalStrikes > 0 ? (totalBalls / totalStrikes).toFixed(2) : '0.00',
      whip:
        inningsPitched > 0
          ? ((walks + totalHits) / inningsPitched).toFixed(2)
          : '0.00',
      fip:
        inningsPitched > 0
          ? (
              (13 * homeRuns + 3 * walks - 2 * strikeouts) / inningsPitched +
              3.1
            ).toFixed(2)
          : '0.00',
      era:
        inningsPitched > 0
          ? ((earnedRuns * inningsPitched) / inningsPitched).toFixed(2)
          : '0.00',
    };
  };

  return (
    <div className="mt-6 rounded-lg border border-gray-300 bg-white p-6">
      {categories.map(category => (
        <div key={category.id}>
          <h2 className="mb-4 text-xl font-bold">{category.name}</h2>

          {/* Header row with inning titles */}
          <div
            className="mb-4 grid gap-2"
            style={{ gridTemplateColumns: `1fr repeat(${innings}, 1fr)` }}
          >
            <div></div>
            {Array.from({ length: innings }, (_, i) => (
              <div key={i} className="text-center">
                <label className="block text-sm font-medium">Inning {i + 1}</label>
              </div>
            ))}
          </div>

          {/* Attribute rows */}
          {category.attributes
            ?.filter(
              (attr: Attribute) =>
                !attr.name.includes('Commentary') && attr.name !== 'avgScore'
            )
            .map((attribute: Attribute) => (
              <div
                key={attribute.id}
                className="mb-2 grid gap-2"
                style={{ gridTemplateColumns: `1fr repeat(${innings}, 1fr)` }}
              >
                <div className="flex items-center">
                  <h3 className="text-sm font-medium">{attribute.name}</h3>
                </div>
                {Array.from({ length: innings }, (_, i) => (
                  <div key={i} className="text-center">
                    <input
                      type="number"
                      min={0}
                      max={100}
                      className="w-full rounded border border-gray-300 p-1 text-center text-sm"
                      value={getInningScore(
                        String(category.id),
                        String(attribute.id),
                        i
                      )}
                      onChange={e =>
                        handleInningScoreChange(
                          String(category.id),
                          String(attribute.id),
                          i,
                          e.target.value
                        )
                      }
                      placeholder="-"
                    />
                  </div>
                ))}
              </div>
            ))}

          {/* Statistics Section */}
          <div className="mt-6 grid grid-cols-7 gap-4 rounded-lg bg-gray-50 p-4">
            <div className="text-center">
              <div className="text-sm font-medium text-gray-600">
                1st Pitch Strike %
              </div>
              <div className="text-lg font-bold">
                {calculateStats(String(category.id)).firstPitchStrikePercent}%
              </div>
            </div>
            <div className="text-center">
              <div className="text-sm font-medium text-gray-600">Hits vs. Inning</div>
              <div className="text-lg font-bold">
                {calculateStats(String(category.id)).hitsVsInning}
              </div>
            </div>
            <div className="text-center">
              <div className="text-sm font-medium text-gray-600">Total Pitch Count</div>
              <div className="text-lg font-bold">
                {calculateStats(String(category.id)).totalPitchCount}
              </div>
            </div>
            <div className="text-center">
              <div className="text-sm font-medium text-gray-600">Ball/Strike Ratio</div>
              <div className="text-lg font-bold">
                {calculateStats(String(category.id)).ballStrikeRatio}
              </div>
            </div>
            <div className="text-center">
              <div className="text-sm font-medium text-gray-600">WHIP</div>
              <div className="text-lg font-bold">
                {calculateStats(String(category.id)).whip}
              </div>
            </div>
            <div className="text-center">
              <div className="text-sm font-medium text-gray-600">FIP</div>
              <div className="text-lg font-bold">
                {calculateStats(String(category.id)).fip}
              </div>
            </div>
            <div className="text-center">
              <div className="text-sm font-medium text-gray-600">ERA</div>
              <div className="text-lg font-bold">
                {calculateStats(String(category.id)).era}
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default PitcherComponent;
