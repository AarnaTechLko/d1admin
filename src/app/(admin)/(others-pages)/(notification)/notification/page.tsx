'use client'

import { useEffect, useState } from 'react'
import axios from 'axios'
import Label from '@/components/form/Label'
import TextArea from '@/components/form/input/TextArea'
import Button from '@/components/ui/button/Button'

interface Entity {
    id: string
    name?: string
    country?: string
    state?: string
    city?: string
}

export default function NotificationPage() {
    const [type, setType] = useState('')
    const [entities, setEntities] = useState<Entity[]>([])

    const [country, setCountry] = useState('')
    const [state, setState] = useState('')
    const [city, setCity] = useState('')

    const [filteredCountries, setFilteredCountries] = useState<string[]>([])
    const [filteredStates, setFilteredStates] = useState<string[]>([])
    const [filteredCities, setFilteredCities] = useState<string[]>([])

    const [message, setMessage] = useState('')
    const [isSubmitting, setIsSubmitting] = useState(false)

    const [selectedIds, setSelectedIds] = useState<string[]>([])

    // Fetch entities based on type
    // Fetch entities based on type
useEffect(() => {
    if (!type) return;
  
    const fetchData = async () => {
      const res = await axios.get(`/api/geolocation/${type}`);
      const data = res.data as Entity[];
      setEntities(data);
  
      const uniqueCountries = [
        ...new Set(data.map((item) => item.country).filter(Boolean)),
      ] as string[];
      setFilteredCountries(uniqueCountries);
  
      setCountry('');
      setState('');
      setCity('');
      setFilteredStates([]);
      setFilteredCities([]);
      setSelectedIds([]);
    };
  
    fetchData();
  }, [type]);
  
  // ✅ Add `entities` as dependency
  useEffect(() => {
    if (!country) {
      setFilteredStates([]);
      return;
    }
  
    const states = [
      ...new Set(
        entities.filter((item) => item.country === country).map((item) => item.state)
      ),
    ].filter(Boolean) as string[];
  
    setFilteredStates(states);
    setState('');
    setCity('');
    setFilteredCities([]);
  }, [country, entities]);
  
  // ✅ Add `entities`, `country`, and `state` as dependencies
  useEffect(() => {
    if (!state) {
      setFilteredCities([]);
      return;
    }
  
    const cities = [
      ...new Set(
        entities
          .filter((item) => item.country === country && item.state === state)
          .map((item) => item.city)
      ),
    ].filter(Boolean) as string[];
  
    setFilteredCities(cities);
    setCity('');
  }, [state, country, entities]);
  

    const handleCheckboxChange = (id: string) => {
        setSelectedIds((prev) => {
            const updated = prev.includes(id)
                ? prev.filter((selectedId) => selectedId !== id)
                : [...prev, id]

            console.log('Currently selected IDs:', updated)
            return updated
        })
    }

    const handleSubmit = async () => {
        if (!type || selectedIds.length === 0 || !message) {
          alert('Please select a type, message, and at least one recipient.')
          return
        }
      
        const payload = {
          type,
          country,
          state,
          city,
          message,
          targetIds: selectedIds,
        }
      
        console.log(" Payload being sent:", payload)
      
        setIsSubmitting(true)
      
        try {
          const response = await axios.post(`/api/geolocation/${type}`, payload)
          console.log(" Response from server:", response)
      
          alert('Notification sent successfully!')

          setMessage('')
          setSelectedIds([])
        } catch (err) {
          console.error(" Error sending notification:", err)
          alert('Failed to send notification.')
        } finally {
          setIsSubmitting(false)
          console.log(" Notification process finished")
        }
      }
      

    const matchingEntities = entities.filter((item) => {
        return (
            (!country || item.country === country) &&
            (!state || item.state === state) &&
            (!city || item.city === city)
        )
    })

    const handleSelectAll = (checked: boolean) => {
        if (checked) {
            setSelectedIds(matchingEntities.map((item) => item.id))
        } else {
            setSelectedIds([])
        }
    }

    return (
        <div className="max-w-5xl mx-auto px-6 py-10">
            <div className="bg-white shadow-xl rounded-2xl p-8 space-y-6 border border-gray-200">
                <h1 className="text-3xl font-bold text-gray-800">📢 Send Notification</h1>
                <p className="text-sm text-gray-500">
                    Select a target group and location to send a broadcast message.
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <Label>Type</Label>
                        <select
                            className="w-full p-2 mt-1 border rounded-lg bg-white"
                            value={type}
                            onChange={(e) => setType(e.target.value)}
                            required
                        >
                            <option value="">Select Type</option>
                            <option value="organization">Organization</option>
                            <option value="player">Player</option>
                            <option value="coach">Coach</option>
                        </select>
                    </div>

                    {/* country dropdown start */}
                    <div>
                        <Label>Country</Label>
                        <select
                            className="w-full p-2 mt-1 border rounded-lg bg-white"
                            value={country}
                            onChange={(e) => setCountry(e.target.value)}
                        >
                            <option value="">Select Country</option>
                            {filteredCountries.map((c) => (
                                <option key={c} value={c}>
                                    {c}
                                </option>
                            ))}
                        </select>
                        {/* <p className="text-xs text-gray-500 mt-1">
              You can send notifications using only country. State and city are optional.
            </p> */}
                    </div>
                    {/* country dropdown end */}


                    {/* state dropdown start */}
                    <div>
                        <Label>State</Label>
                        <select
                            className="w-full p-2 mt-1 border rounded-lg bg-white"
                            value={state}
                            onChange={(e) => setState(e.target.value)}
                            disabled={!country}
                        >
                            <option value="">Select State</option>
                            {filteredStates.map((s) => (
                                <option key={s} value={s}>
                                    {s}
                                </option>
                            ))}
                        </select>
                    </div>
                   {/* state dropdown end */}

                   {/* city dropdown start */}
                    <div>
                        <Label>City</Label>
                        <select
                            className="w-full p-2 mt-1 border rounded-lg bg-white"
                            value={city}
                            onChange={(e) => setCity(e.target.value)}
                            disabled={!state}
                        >
                            <option value="">Select City</option>
                            {filteredCities.map((c) => (
                                <option key={c} value={c}>
                                    {c}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>
                {/* city dropdown end */}

                {/* matching box start there */}


                {matchingEntities.length > 0 && (
                    <div className="bg-gray-50 p-4 rounded-md border text-sm text-gray-700">
                        <p className="font-semibold mb-2">
                            Select {type} name&#39;s to receive the notification:
                        </p>

                        

                        <label className="flex items-center gap-2 mb-3">
                            <input
                                type="checkbox"
                                onChange={(e) => handleSelectAll(e.target.checked)}
                                checked={
                                    selectedIds.length === matchingEntities.length &&
                                    matchingEntities.length > 0
                                }
                            />
                            <span className="text-xs font-medium">Select All</span>
                        </label>

                         <hr className="my-3 border-gray-300" />

                        <div className="max-h-48 overflow-y-auto flex flex-col gap-2">
                            {matchingEntities.map((entity) => (
                                <label key={entity.id} className="flex items-center gap-2">
                                    <input
                                        type="checkbox"
                                        checked={selectedIds.includes(entity.id)}
                                        onChange={() => handleCheckboxChange(entity.id)}
                                    />
                                    <span className="text-xs">
                                        {entity.name || `ID: ${entity.id}`}
                                    </span>
                                </label>
                            ))}
                        </div>
                    </div>
                )}
                {/* matching box END */}

                {/* message box show there */}

                <div>
                    <Label>Message</Label>
                    <TextArea
                        className="w-full mt-1 border rounded-lg text-black"
                        rows={5}
                        value={message}
                        placeholder="Enter your notification message here..."
                        onChange={(value: string) => setMessage(value)}
                    />
                </div>
                {/* message box end here */}

                {/* submit button start */}
                <div className="pt-4 text-right">
                    <Button
                        onClick={handleSubmit}
                        disabled={isSubmitting}
                        className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-6 py-2 rounded-xl transition"
                    >
                        {isSubmitting ? 'Sending...' : 'Send Notification'}
                    </Button>
                </div>
                {/* submit button end */}
            </div>
        </div>
    )
};
