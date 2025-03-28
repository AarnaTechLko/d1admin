"use client";
import { useEffect, useState } from "react";
import Image from "next/image";

interface CoachData {
  firstName: string;
  lastName: string;
  image?: string;
  sport: string;
  clubName: string;
  gender: string;
  licenseType: string;
  country: string;
  state: string;
  city: string;
  expectedCharge: number;
  qualifications: string;
  cv?: string;
  license?: string;
}

interface EvaluationItem {
  firstName: string;
  lastName: string;
  rating: number;
  image?: string;
}

interface EvaluationCharge {
  id: number;
  charge: number;
  turnaroundTime: string;
}

export default function ProfilePage() {
  const [coachData, setCoachData] = useState<CoachData | null>(null);
  const [evaluationList, setEvaluationList] = useState<EvaluationItem[]>([]);
  const [evaluationCharges, setEvaluationCharges] = useState<EvaluationCharge[]>([]);
  const [isRequested, setIsRequested] = useState<boolean>(false);
  const [totalLicenses, setTotalLicenses] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

 
  useEffect(() => {
    const fetchCoachData = async () => {
      setLoading(true);
      setError(null);
  
      try {
        const response = await fetch("/api/view1", {
          method: "GET",
          headers: { "Content-Type": "application/json" },
        });
  
      
  
        if (!response.ok) {
          throw new Error(`Failed to fetch data: ${response.status}`);
      }

      
      const data = await response.json();
      console.log("API Response:", data); // Debugging step ✅

      if (!data || typeof data !== "object") {
        throw new Error("Invalid response format from API");
      }

      if (!data.coachdata) {
        throw new Error("coachdata field is missing in API response");
      }

  
        setCoachData(data.coachdata);
        setEvaluationList(data.evaluationlist || []);
        setEvaluationCharges(data.evaluationCharges || []);
        setIsRequested(data.isRequested === 1); // Convert to boolean
        setTotalLicenses(data.totalLicenses || "not available");
  
      } catch (error) {
        if (error instanceof Error) {
          console.error("Error fetching data:", error.message);
          setError(error.message);
        } else {
          console.error("An unknown error occurred:", error);
          setError("An unknown error occurred.");
        }
      } finally {
        setLoading(false);  // ✅ Ensure loading state is updated
      }
    };
  
    fetchCoachData();
    
  }, []);
 


  if (loading) return <p>Loading...</p>;
  if (error) return <p className="text-red-600">Error: {error}</p>;
  if (!coachData) return <p>No data found</p>;
  

  return (
    <div className="container mx-auto p-6">
      {/* Profile Section */}
      <div className="flex items-center gap-6">
      <Image
  src={coachData.image ? coachData.image : "/profile-image.jpg"} // Ensure the fallback works
  alt="Profile Picture"
  width={100}
  height={100}  
  className="rounded-full"
/>

        <div>
          <h1 className="text-2xl font-bold">
            {coachData.firstName} {coachData.lastName}
          </h1>
          <p className="text-gray-600">Coach</p>
        </div>
      </div>

      {/* Request Evaluation Button */}
      {isRequested ? (
        <p className="mt-4 text-green-600">Evaluation already requested</p>
      ) : (
        <button className="mt-4 bg-blue-500 text-white px-4 py-2 rounded">
          Login to Request Evaluation
        </button>
      )}

      {/* General Information */}
      <div className="mt-6 border rounded-lg">
        <h2 className="bg-blue-300 px-4 py-2 font-semibold">General Information</h2>
        <div className="p-4">
          <p><strong>Sport:</strong> {coachData.sport}</p>
          <p><strong>Title/Organization(s)/Affiliation(s):</strong> {coachData.clubName}</p>
          <p><strong>Gender:</strong> {coachData.gender}</p>
          <p><strong>Coaching License Type:</strong> {coachData.licenseType}</p>
          <p><strong>Country:</strong> {coachData.country}</p>
          <p><strong>State/Province:</strong> {coachData.state}</p>
          <p><strong>City:</strong> {coachData.city}</p>
        </div>
      </div>

      {/* Evaluation Rates */}
      <div className="mt-6 border rounded-lg">
        <h2 className="bg-blue-300 px-4 py-2 font-semibold">Evaluation Rate(s)</h2>
        <div className="p-4">
          <table className="w-full border">
            <thead>
              <tr className="border-b">
                <th className="p-2">Turnaround Time</th>
                <th className="p-2">Evaluation Rate</th>
              </tr>
            </thead>
            <tbody>
              {evaluationCharges.length > 0 ? (
                evaluationCharges.map((charge) => (
                  <tr key={charge.id}>
                    <td className="p-2">{charge.turnaroundTime}</td>
                    <td className="p-2">${charge.charge}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td className="p-2" colSpan={2}>No evaluation rates available</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Background */}
      <div className="mt-6 border rounded-lg">
        <h2 className="bg-blue-300 px-4 py-2 font-semibold">Background</h2>
        <div className="p-4">
          <p>{coachData.qualifications}</p>
          <div className="mt-4">
            {coachData.cv && (
              <a href={coachData.cv} className="text-blue-500 block">
                📄 Download CV
              </a>
            )}
            {coachData.license && (
              <a href={coachData.license} className="text-blue-500 block">
                📄 Download Coaching License
              </a>
            )}
          </div>
        </div>
      </div>

      {/* Reviews Section */}
      <div className="mt-6 border rounded-lg">
        <h2 className="bg-blue-300 px-4 py-2 font-semibold">Reviews</h2>
        <div className="p-4">
          {evaluationList.length > 0 ? (
            evaluationList.map((review) => (
              <div key={review.firstName + review.lastName} className="border-b py-2 flex items-center gap-4">
                {/* <Image
                  src={review.image || "/default-user.jpg"}
                  width={40}
                  height={40}
                  alt="User"
                  className="rounded-full"
                /> */}
                <p>{review.firstName} {review.lastName}</p>
                <span className="ml-auto">Rating: ⭐{review.rating} / 5</span>
              </div>
            ))
          ) : (
            <p>No reviews yet</p>
          )}
        </div>
      </div>

      {/* License Availability */}
      <div className="mt-6">
        <p><strong>License Availability:</strong> {totalLicenses}</p>
      </div>
    </div>
  );
}
