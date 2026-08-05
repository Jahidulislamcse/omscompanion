<?php

namespace App\Http\Controllers;

use Illuminate\Support\Facades\Auth;
use Barryvdh\DomPDF\Facade\Pdf;

class CertificateController extends Controller
{
    public function download()
    {
        $user = Auth::user();

        if ($user->role !== 'member' || $user->status !== 'approved') {
            abort(403, 'Unauthorized certificate access.');
        }

        $data = [
            'name' => $user->name,
            'member_id' => $user->member_id,
            'clinic_name' => $user->clinic_name,
            'bds_number' => $user->bds_registration_number,
            'date' => $user->approved_at ? $user->approved_at->format('F d, Y') : now()->format('F d, Y'),
        ];

        $pdf = Pdf::loadView('pdf.certificate', $data)
            ->setPaper('a4', 'landscape');

        $filename = 'Certificate_' . str_replace('-', '_', $user->member_id) . '.pdf';

        return $pdf->download($filename);
    }
}
