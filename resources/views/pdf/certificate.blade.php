<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Membership Certificate</title>
    <style>
        @page {
            size: A4 landscape;
            margin: 0;
        }
        body {
            font-family: 'Georgia', serif;
            background-color: #fcfbf7;
            margin: 0;
            padding: 0;
            width: 297mm;
            height: 210mm;
            display: block;
            position: relative;
            color: #2c2519;
        }
        .container {
            border: 15px solid #d4af37;
            margin: 15mm;
            height: 150mm;
            padding: 10mm;
            position: relative;
            background-color: #ffffff;
            box-shadow: inset 0 0 40px rgba(0, 0, 0, 0.05);
        }
        .inner-border {
            border: 2px solid #b3922e;
            height: 100%;
            width: 100%;
            position: relative;
            text-align: center;
            box-sizing: border-box;
        }
        .header {
            margin-top: 15mm;
            text-transform: uppercase;
            letter-spacing: 5px;
            font-size: 14pt;
            color: #b3922e;
            font-weight: bold;
        }
        .logo-placeholder {
            margin: 5mm auto;
            width: 20mm;
            height: 20mm;
            border: 2px solid #b3922e;
            border-radius: 50%;
            line-height: 20mm;
            font-size: 24pt;
            color: #b3922e;
            font-weight: bold;
        }
        .title {
            font-size: 32pt;
            font-weight: normal;
            margin: 5mm 0;
            color: #1a1a1a;
            font-family: 'Times New Roman', serif;
        }
        .certify {
            font-size: 13pt;
            font-style: italic;
            color: #555;
            margin: 4mm 0;
        }
        .name {
            font-size: 28pt;
            font-weight: bold;
            color: #1a1a1a;
            border-bottom: 2px solid #b3922e;
            display: inline-block;
            padding-bottom: 2mm;
            margin: 2mm 0;
            min-width: 120mm;
        }
        .details {
            font-size: 12pt;
            margin: 5mm auto;
            max-width: 180mm;
            line-height: 1.6;
            color: #444;
        }
        .bold {
            font-weight: bold;
            color: #1a1a1a;
        }
        .footer-sec {
            position: absolute;
            bottom: 12mm;
            width: 100%;
            left: 0;
            padding: 0 20mm;
            box-sizing: border-box;
        }
        .footer-col {
            display: inline-block;
            width: 30%;
            text-align: center;
            vertical-align: bottom;
        }
        .signature-line {
            border-bottom: 1px solid #777;
            margin-bottom: 2mm;
            height: 10mm;
        }
        .footer-label {
            font-size: 10pt;
            text-transform: uppercase;
            letter-spacing: 1px;
            color: #666;
        }
        .badge {
            position: absolute;
            top: 5mm;
            right: 5mm;
            width: 25mm;
            height: 25mm;
            border: 2px dashed #b3922e;
            border-radius: 50%;
            text-align: center;
            line-height: 25mm;
            font-size: 8pt;
            color: #b3922e;
            transform: rotate(-15deg);
            font-weight: bold;
            text-transform: uppercase;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="inner-border">
            <div class="badge">Official BDS</div>
            
            <div class="header">DentistChamber Association</div>
            
            <div class="logo-placeholder">&#128715;</div>
            
            <div class="title">Certificate of Membership</div>
            
            <div class="certify">This is to certify that</div>
            
            <div class="name">Dr. {{ $name }}</div>
            
            <div class="details">
                is registered as a verified <span class="bold">BDS Doctor Member</span> of DentistChamber.<br>
                Granted full membership rights, access to resources, and referral privileges.<br>
                <span class="bold">Member ID:</span> {{ $member_id }} &nbsp;&nbsp;|&nbsp;&nbsp; <span class="bold">Clinic:</span> {{ $clinic_name }}
            </div>
            
            <div class="footer-sec">
                <div class="footer-col" style="float: left;">
                    <div style="font-size: 11pt; font-weight: bold; padding-top: 5mm;">{{ $date }}</div>
                    <div class="signature-line" style="border: none;"></div>
                    <div class="footer-label">Issue Date</div>
                </div>
                
                <div class="footer-col" style="margin: 0 10%; display: inline-block;">
                    <div style="font-size: 10pt; font-weight: bold; color: #b3922e; border: 1px solid #b3922e; padding: 2px; border-radius: 4px; display: inline-block; width: 35mm; margin: 0 auto 2mm;">
                        {{ $bds_number }}
                    </div>
                    <div class="footer-label">BDS Registration No.</div>
                </div>
                
                <div class="footer-col" style="float: right;">
                    <div class="signature-line">
                        <span style="font-family: 'Brush Script MT', cursive, sans-serif; font-size: 16pt; color: #b3922e; line-height: 10mm; display: block; height: 10mm; margin-top: -3mm;">DentistChamber</span>
                    </div>
                    <div class="footer-label">Authorized Registrar</div>
                </div>
            </div>
        </div>
    </div>
</body>
</html>
