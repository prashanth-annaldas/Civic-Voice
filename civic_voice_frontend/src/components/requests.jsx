import { useState } from 'react';
import Location from './geoLocation';
function requests(){
    const [text, setText] = useState("");

    return <div className="col-md-6 problems">
                <div className="mb-3">
                    <label className="form-label fw-semibold">Describe the request/demands</label>
                    <textarea
                    className="form-control"
                    rows="4"
                    placeholder="Write problem details..."
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    />
                </div>

                <div className="mb-3">
                    <Location />
                </div>

                <button className="btn btn-primary px-4">
                    Submit
                </button>
                <br />
                <div className='result'>
                    
                </div>
            </div>
}

export default requests;