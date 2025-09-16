'use client';
import dynamic from 'next/dynamic';
import { useEffect, useState } from 'react';
import axios from 'axios';
import Swal from 'sweetalert2';
import Label from '@/components/form/Label';
// import TextArea from '@/components/form/input/TextArea';
import Button from '@/components/ui/button/Button';
import { useRoleGuard } from "@/hooks/useRoleGaurd";
import 'react-quill-new/dist/quill.snow.css';


interface Entity {
  id: string;
  name?: string;
  country?: string;
  country_name?: string;
  state?: string;
  city?: string;
  gender?: string;
  position?: string;
  email?: string;
  sport?: number;
  ageGroup?: string;
  graduation?: string;
}

interface Sport {

  id: number;
  name: string;
}

const ReactQuill = dynamic(() => import('react-quill-new'), { ssr: false });

export default function NotificationPage() {
  useRoleGuard();

  const [type, setType] = useState('');
  const [status, setStatus] = useState('');


  const [entities, setEntities] = useState<Entity[]>([]);

  const [country, setCountry] = useState('');
  const [state, setState] = useState('');
  const [city, setCity] = useState('');
  const [gender, setGender] = useState('');
  const [position, setPosition] = useState('');
  const [ageGroup, setAgeGroup] = useState('');
  const [graduation, setGraduation] = useState('');
  const [sport, setSport] = useState(0);

  const [filteredCountries, setFilteredCountries] = useState<string[]>([]);
  const [filteredStates, setFilteredStates] = useState<string[]>([]);
  const [filteredCities, setFilteredCities] = useState<string[]>([]);
  const [filteredSports, setFilteredSports] = useState<Sport[]>([]);


  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [sendEmail, setSendEmail] = useState(false);
  const [sendSMS, setSendSMS] = useState(false);
  const [sendInternal, setSendInternal] = useState(false);

  const ageGroups = [
    'U6',
    'U7',
    'U8',
    'U9',
    'U10',
    'U11',
    'U12',
    'U13',
    'U14',
    'U15',
    'U16',
    'U17',
    'U18',
    'U19',
    'High School',
    'College',
    'Semi Pro',
    'Pro',
  ];

const currentYear = new Date().getFullYear();
const graduationYears = Array.from(
  { length: 31 },
  (_, i) => currentYear - 20 + i,
)
  .map(year => year.toString())
  .sort((a, b) => parseInt(b) - parseInt(a));
  const [subject, setSubject] = useState('');

  const matchingEntities = Array.isArray(entities)
    ? entities.filter((item) => {
      const matchesLocation =
        (!country || item.country === country) &&
        (!state || item.state === state) &&
        (!city || item.city === city);

        const matchesPlayerCriteria =
          type !== 'player' ||
          ((!gender || item.gender?.toLowerCase() === gender.toLowerCase()) &&
            (!position || item.position?.toLowerCase() === position.toLowerCase()) && 
            (!ageGroup || item.ageGroup === ageGroup) &&
            (!graduation || item.graduation === graduation)
          );

        // console.log("Sport: ", sport)

        const matchesSport = (!sport || item.sport === sport)
            
        return matchesLocation && matchesPlayerCriteria && matchesSport;
      })
    : [];

  useEffect(() => {
    if (!type) return;

    // console.log("Type: ", type);


    const queryParams = new URLSearchParams({
      status,
    });

    //   if (status){
    //     console.log("Stat: ", status);
    //       queryParams.append("status", status)
    //   }

    // console.log("queryParams: ", queryParams.toString())

    //   const res = await axios.get(`/api/geolocation/${queryParams.toString()}`);

    console.log("Status: ", status);

    const fetchData = async () => {
      try {
        const res = await axios.get(`/api/bulkemail/${type}?${queryParams.toString()}`);
        const data = Array.isArray(res.data) ? res.data : [];
        setEntities(data);

        const uniqueCountries = [...new Set(data.map((item) => item.country).filter(Boolean))] as string[];
        setFilteredCountries(uniqueCountries);

        setCountry('');
        setState('');
        setCity('');
        setFilteredStates([]);
        setFilteredCities([]);
        setSelectedIds([]);
        setGender('');
        setPosition('');
        setSport(0);
        setAgeGroup('');       
      } catch (err) {
        console.error('Failed to fetch entities:', err);
      }
    };

    fetchData();
  }, [type, status]);


  useEffect( () => {


    const fetchData = async () => {

      try{
        const response = await fetch(
          `/api/sports`
        );

        if (!response.ok) throw new Error("Failed to fetch data");

        const data = await response.json();

        console.log("DATA: ", data.sport)


        setFilteredSports(data.sport)
      }
      catch (error){
        console.error('Failed to fetch sports: ', error)
      }
    };

    fetchData();

  },[])

  useEffect(() => {
    if (!country) {
      setFilteredStates([]);
      return;
    }

    const states = [...new Set(
      entities.filter((item) => item.country === country).map((item) => item.state)
    )].filter(Boolean) as string[];

    setFilteredStates(states);
    setState('');
    setCity('');
    setFilteredCities([]);
  }, [country, entities]);

  useEffect(() => {
    if (!state) {
      setFilteredCities([]);
      return;
    }

    const cities = [...new Set(
      entities.filter((item) => item.country === country && item.state === state).map((item) => item.city)
    )].filter(Boolean) as string[];

    setFilteredCities(cities);
    setCity('');
  }, [state, country, entities]);

  const handleCheckboxChange = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((selectedId) => selectedId !== id) : [...prev, id]
    );
  };

  const handleSelectAll = (checked: boolean) => {
    setSelectedIds(checked ? matchingEntities.map((item) => item.id) : []);
  };

  const handleSubmit = async () => {
    if (!type || selectedIds.length === 0 || !subject || !message) {
      Swal.fire({
        icon: 'warning',
        title: 'Missing Fields',
        text: 'Please select a type, subject, message, and at least one recipient.',
      });
      return;
    }

    const payload = {
      type,
      country,
      state,
      city,
      gender: type === 'player' ? gender : undefined,
      position: type === 'player' ? position : undefined,
      subject,
      message,
      targetIds: selectedIds,
      methods: {
        email: sendEmail,
        sms: sendSMS,
        internal: sendInternal,
      },
    };

    setIsSubmitting(true);

    try {
      await axios.post(`/api/bulkemail/${type}`, payload);
      Swal.fire({
        icon: 'success',
        title: 'Notification Sent',
        text: 'Your message has been successfully delivered.',
      });
      setSubject('');
      setMessage('');
      setSelectedIds([]);
    } catch (err) {
      console.error('Error sending notification:', err);
      Swal.fire({
        icon: 'error',
        title: 'Failed',
        text: 'Something went wrong while sending the notification.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-6 py-10">
      <div className="bg-white shadow-xl rounded-2xl p-8 space-y-6 border border-gray-200">
        <h1 className="text-3xl font-bold text-gray-800">📢 Send Notification</h1>
        <p className="text-sm text-gray-500">Select a target group and location to send a broadcast message.</p>

        <div className="flex items-center gap-6">
          {([
            ['Email', sendEmail, setSendEmail],
            ['SMS', sendSMS, setSendSMS],
            ['Internal Message', sendInternal, setSendInternal]
          ] as [string, boolean, React.Dispatch<React.SetStateAction<boolean>>][]).map(
            ([label, state, setter]) => (
              <label key={label} className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={state}
                  onChange={() => setter(!state)}
                />
                <span>{label}</span>
              </label>
            )
          )}

        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label>Type</Label>
            <select className="w-full p-2 mt-1 border rounded-lg bg-white" value={type} onChange={(e) => setType(e.target.value)}>
              <option value="">Select Type</option>
              <option value="organization">Organization</option>
              <option value="player">Player</option>
              <option value="coach">Coach</option>
            </select>
          </div>

          <div>
            <Label>Status</Label>
            <select className="w-full p-2 mt-1 border rounded-lg bg-white" value={status} onChange={(e) => setStatus(e.target.value)} disabled={!type}>
              <option value="">Select Status</option>
              <option value="no-profile">Profile Not Completed</option>
              <option value="profile">Profile Completed</option>
              <option value="unsuspend">Unsuspended</option>
              <option value="suspend">Suspended</option>
              <option className={type !== "coach" ? 'hidden' : ''} value="unapproved">Unapproved</option>
              <option className={type !== "coach" ? 'hidden' : ''} value="approved">Approved</option>
              <option value="inactive">Inactive</option>
              <option value="active">Active</option>
            </select>
          </div>

          <div>
            <Label>Sport</Label>
            <select className="w-full p-2 mt-1 border rounded-lg bg-white" value={sport} onChange={(e) => setSport(Number(e.target.value))} disabled={!type}>
              <option value="">Select Sport</option>
                {filteredSports.map((sp) => (
                  <option key={sp.name} value={sp.id}>
                    {sp.name}
                  </option>
                ))}
            </select>
          </div>


          <div>
            <Label>Country</Label>
            <select className="w-full p-2 mt-1 border rounded-lg bg-white" value={country} onChange={(e) => setCountry(e.target.value)}>
              <option value="">Select Country</option>
              {filteredCountries.map((c) => (
                <option key={c} value={c}>
                  {entities.find((e) => e.country === c)?.country_name || c}
                </option>
              ))}
            </select>
          </div>

          <div>
            <Label>State</Label>
            <select className="w-full p-2 mt-1 border rounded-lg bg-white" value={state} onChange={(e) => setState(e.target.value)} disabled={!country}>
              <option value="">Select State</option>
              {filteredStates.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>

          <div>
            <Label>City</Label>
            <select className="w-full p-2 mt-1 border rounded-lg bg-white" value={city} onChange={(e) => setCity(e.target.value)} disabled={!state}>
              <option value="">Select City</option>
              {filteredCities.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          {type === 'player' && (
            <>
              <div>
                <Label>Gender (optional)</Label>
                <select className="w-full p-2 mt-1 border rounded-lg bg-white" value={gender} onChange={(e) => setGender(e.target.value)} disabled={type !== 'player'}>
                  <option value="">Select Gender</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div>
                <Label>Position (optional)</Label>
                <select className="w-full p-2 mt-1 border rounded-lg bg-white" value={position} onChange={(e) => setPosition(e.target.value)} disabled={type !== 'player'}>
                  <option value="">Select Position</option>
                  <option value="Goalkeeper">Goalkeeper</option>
                  <option value="Defender">Defender</option>
                  <option value="Midfielder">Midfielder</option>
                  <option value="Forward">Center Forward</option>
                  <option value="Striker">Striker</option>
                  <option value="Striker">Outside Back/ Wingback</option>
                  <option value="Striker">Centerback</option>
                  <option value="Striker">Holding Mid</option>
                  <option value="Striker">Attacking Mid</option>
                  <option value="Striker">Winger</option>
                </select>
              </div>

              <div>
                <Label>Age Group</Label>
                  <select className="w-full p-2 mt-1 border rounded-lg bg-white" value={ageGroup} onChange={(e) => setAgeGroup(e.target.value)} disabled={type !== 'player'}>
                    <option value="">Select Age Group</option>
                    {ageGroups.map(group => (
                      <option key={group} value={group}>
                        {group}
                      </option>
                    ))}
                  </select>
              </div>

              <div>
                <Label>Graduation Year</Label>
                  <select className="w-full p-2 mt-1 border rounded-lg bg-white" value={graduation} onChange={(e) => setGraduation(e.target.value)} disabled={type !== 'player'}>
                    <option value="">Select Graduation Year</option>
                    {graduationYears.map(year => (
                      <option key={year} value={year}>
                        {year}
                      </option>
                    ))}
                  </select>
              </div>

            </>
          )}
        </div>

        {matchingEntities.length > 0 && (
          <div className="bg-gray-50 p-4 rounded-md border text-sm text-gray-700">
            <p className="font-semibold mb-2">
              Select {type} name{matchingEntities.length > 1 ? 's' : ''} to receive the notification:
            </p>
            <label className="flex items-center gap-2 mb-3">
              <input type="checkbox" onChange={(e) => handleSelectAll(e.target.checked)} checked={selectedIds.length === matchingEntities.length && matchingEntities.length > 0} />
              <span className="text-xs font-medium">Select All</span>
            </label>
            <hr className="my-3 border-gray-300" />
            <div className="max-h-48 overflow-y-auto flex flex-col gap-2">
              {matchingEntities.map((entity) => (
                <label key={entity.id} className="flex items-center gap-2">
                  <input type="checkbox" checked={selectedIds.includes(entity.id)} onChange={() => handleCheckboxChange(entity.id)} />

                  <span className={status !== "no-profile" ? 'text-xs' : 'hidden'}>{entity.name || `ID: ${entity.id}`}</span>

                  <span className={status === "no-profile" ? 'text-xs' : 'hidden'}>{entity.email}</span>

                </label>
              ))}
            </div>
          </div>
        )}

        {/* <div>
          <Label>Message</Label>
          <TextArea className="w-full mt-1 border rounded-lg text-black" rows={5} value={message} placeholder="Enter your notification message here..." onChange={(value: string) => setMessage(value)} />
        </div> */}
        <div>
          <Label>Subject</Label>
          <input
            type="text"
            className="w-full p-2 mt-1 border rounded-lg bg-white"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            placeholder="Enter notification subject..."
          />
        </div>
        <div>
          <Label>Message</Label>
          <ReactQuill
            theme="snow"
            value={message}
            onChange={setMessage}
            placeholder="Write your message here..."
            modules={{
              toolbar: [
                [{ 'header': [1, 2, false] }],
                ['bold', 'italic', 'underline'],
                ['link'],
                [{ 'list': 'ordered' }, { 'list': 'bullet' }],
                ['clean']
              ],
            }}
            style={{ height: '200px', marginBottom: '50px' }}
          />
        </div>

        <div className="pt-4 text-right">
          <Button onClick={handleSubmit} disabled={isSubmitting} className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-6 py-2 rounded-xl transition">
            {isSubmitting ? 'Sending...' : 'Send Notification'}
          </Button>
        </div>
      </div>
    </div>
  );
}
