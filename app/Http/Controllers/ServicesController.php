<?php

namespace App\Http\Controllers;

use App\Models\LandingSetting;
use App\Models\Service;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ServicesController extends Controller
{
    public function index()
    {
        // Seed default services if database is empty
        if (Service::count() === 0) {
            $this->seedDefaultServices();
        }

        $settings = LandingSetting::all()->pluck('value', 'key')->toArray();

        if (empty($settings['services_subtitle'])) {
            $settings['services_subtitle'] = "The OMS Companion team is a group of highly skilled specialists in Oral & Maxillofacial Surgery, Oral Medicine, Reconstructive Surgery, and Oncology, working collaboratively to deliver the highest standard of care and achieve optimal outcomes for a wide range of oral and maxillofacial diseases";
        }

        $services = Service::orderBy('order_index', 'asc')->orderBy('id', 'asc')->get();

        return Inertia::render('Services/Index', [
            'settings' => $settings,
            'services' => $services,
        ]);
    }

    private function seedDefaultServices()
    {
        $defaultServices = [
            ['prefix' => 'MANAGEMENT OF', 'title' => 'JAW CYSTS', 'order_index' => 1],
            ['prefix' => 'MANAGEMENT OF', 'title' => 'ORAL CANCER', 'order_index' => 2],
            ['prefix' => 'MANAGEMENT OF', 'title' => 'FACIAL TRAUMA', 'order_index' => 3],
            ['prefix' => 'MANAGEMENT OF', 'title' => 'WISDOM TEETH', 'order_index' => 4],
            ['prefix' => 'MANAGEMENT OF', 'title' => 'BENIGN TUMORS', 'order_index' => 5],
            ['prefix' => '', 'title' => 'ORO-FACIAL RECONSTRUCTION', 'order_index' => 6],
            ['prefix' => 'MANAGEMENT OF', 'title' => 'POTENTIALLY MALIGNANT DISORDERS', 'order_index' => 7],
            ['prefix' => 'MANAGEMENT OF', 'title' => 'ORAL MUCOSAL DISEASES', 'order_index' => 8],
            ['prefix' => 'MANAGEMENT OF', 'title' => 'SALIVARY GLAND DISORDERS', 'order_index' => 9],
            ['prefix' => 'MANAGEMENT OF', 'title' => 'JAW DEFORMITIES', 'order_index' => 10],
            ['prefix' => 'MANAGEMENT OF', 'title' => 'DENTOFACIAL ABNORMALITIES', 'order_index' => 11],
            ['prefix' => 'DENTAL', 'title' => 'IMPLANT', 'order_index' => 12],
            ['prefix' => 'MANAGEMENT OF', 'title' => 'FACIAL CLEFTS', 'order_index' => 13],
            ['prefix' => 'SURGICAL', 'title' => 'ENDODONTICS', 'order_index' => 14],
            ['prefix' => 'MANAGEMENT OF', 'title' => 'ODONTOGENIC INFECTIONS', 'order_index' => 15],
            ['prefix' => 'MANAGEMENT OF', 'title' => 'OROFACIAL PAIN', 'order_index' => 16],
            ['prefix' => 'GTR &', 'title' => 'GUIDED BONE REGENERATION', 'order_index' => 17],
            ['prefix' => 'MANAGEMENT OF', 'title' => 'ODONTOGENIC DISEASES OF SINUS', 'order_index' => 18],
            ['prefix' => 'MANAGEMENT OF', 'title' => 'ORAL AUTO-IMMUNO DISEASE', 'order_index' => 19],
            ['prefix' => 'MANAGEMENT OF', 'title' => 'ORAL EFFECT OF CHEMOTHERAPY', 'order_index' => 20],
            ['prefix' => 'MANAGEMENT OF', 'title' => 'ORAL EFFECT OF RADIOTHERAPY', 'order_index' => 21],
            ['prefix' => 'MAXILLOFACIAL', 'title' => 'PROSTHESIS', 'order_index' => 22],
        ];

        foreach ($defaultServices as $service) {
            Service::create($service);
        }
    }
}
