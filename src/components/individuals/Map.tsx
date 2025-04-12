'use client';

import React, { useState } from 'react';
import {
    Radar,
    RadarChart,
    PolarGrid,
    PolarAngleAxis,
    PolarRadiusAxis,
    ResponsiveContainer,
} from 'recharts';
import { Star } from 'lucide-react';

const headerMetrics = ['Speed', 'Ablity', 'COD with ball', 'COD without ball', 'Counter Move Jump'];

const radarSkills = [
    'Receiving & 1st Touch',
    'Shots on Goal',
    'Finishing Touches',
    'Combination Play',
    'Workrate',
    'Pressing from the Front',
    '1v1 Domination',
    'Goal Threat',
    'Being a Good Teammate',
    'Decision Making',
    'No. of Touches in Final 3rd',
    'Off the Ball Movement',
    'Ability to find Space in the box',
    'Runs off the ball/Forward runs',
];

export default function Map() {
    const [headerRatings, setHeaderRatings] = useState<number[]>(Array(headerMetrics.length).fill(7));
    const [skillRatings, setSkillRatings] = useState<number[]>([
        7, 8, 8, 8, 7, 6, 7, 9, 9, 8, 8, 8, 8, 8,
    ]);

    const handleHeaderRatingChange = (index: number, value: number) => {
        const newRatings = [...headerRatings];
        newRatings[index] = value;
        setHeaderRatings(newRatings);
    };

    const handleSkillRatingChange = (index: number, value: number) => {
        const newRatings = [...skillRatings];
        newRatings[index] = value;
        setSkillRatings(newRatings);
    };

    const chartData = radarSkills.map((label, i) => ({
        subject: label,
        A: skillRatings[i],
    }));

    return (
        <div className="p-4 bg-white rounded-xl shadow-lg ">
            {/* Top Section: Header metrics */}
            <div className="w-fit bg-white p-4 rounded-xl shadow">
                <table className="table-auto border-collapse  border-gray-300">
                    <thead>
                        <tr>
                            {headerMetrics.map((metric, index) => (
                                <th key={index} className="px-4 py-2 text-center text-sm font-semibold text-green-900 border border-gray-300 bg-gray-100">
                                    {metric}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            {headerMetrics.map((_, index) => (
                                <td key={index} className="px-4 py-2 border border-gray-300 bg-white">
                                    <div
                                        className="flex justify-center gap-1"
                                        onDoubleClick={() => handleHeaderRatingChange(index, 0)}
                                    >
                                        {[...Array(5)].map((_, i) => (
                                            <Star
                                                key={i}
                                                size={16}
                                                className={`cursor-pointer transition ${headerRatings[index] > i
                                                        ? 'fill-yellow-400 stroke-yellow-400'
                                                        : 'stroke-gray-300'
                                                    }`}
                                                onClick={(e) => {
                                                    e.stopPropagation(); // prevent double-click event
                                                    handleHeaderRatingChange(index, i + 1);
                                                }}
                                            />
                                        ))}
                                    </div>

                                </td>
                            ))}
                        </tr>
                    </tbody>
                </table>
            </div>


            {/* Body: Skills sidebar + Radar */}
            <div className="p-5 flex flex-row gap-8">
                {/* Sidebar with skill values */}
                <div className="flex flex-col gap-2 w-[250px]">
                    {radarSkills.map((label, i) => (
                        <div key={i} className="flex items-center justify-between gap-2">
                            <label className="text-sm text-gray-700 w-[180px]">{label}</label>
                            <input
                                type="number"
                                min={0}
                                max={10}
                                value={skillRatings[i]}
                                onChange={(e) => handleSkillRatingChange(i, Number(e.target.value))}
                                className="w-12 text-center border rounded px-1 py-0.5 text-sm"
                            />
                        </div>
                    ))}
                </div>

                {/* Radar Chart */}
                <div className="flex-1 h-[500px] min-w-[400px]">
                    <ResponsiveContainer>
                        <RadarChart cx="50%" cy="50%" outerRadius="80%" data={chartData}>
                            <PolarGrid />
                            <PolarAngleAxis dataKey="subject" tick={{ fontSize: 10 }} />
                            <PolarRadiusAxis angle={80} domain={[0, 2, 3, 4, 5, 6, 7, 8, 9, 10]} tickCount={10}

                            />
                            <Radar
                                name="Player"
                                dataKey="A"
                                stroke="#1e40af"
                                fill="#3b82f6"
                                fillOpacity={0.5}
                            />
                        </RadarChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </div>
    );
}
