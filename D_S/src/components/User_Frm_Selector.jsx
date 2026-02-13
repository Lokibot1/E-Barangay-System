import React from 'react';
import Req_Form from './Req_Form';
import { Link } from 'react-router-dom';

export default function User_Frm_Selector() {
  return (
    <div style={{padding:'20px 24px'}}>
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',borderBottom:'1px solid #eee',paddingBottom:12}}>
        <h2 style={{margin:0}}>Request for Barangay ID</h2>
        <div>
          <Link to="/forms" className="btn-link">Back to Forms</Link>
        </div>
      </div>

      <div style={{marginTop:20}}>
        <Req_Form />
      </div>
    </div>
  )
}
