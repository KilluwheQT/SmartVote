'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Upload, FileSpreadsheet, CheckCircle, AlertCircle, Download } from 'lucide-react';
import Papa from 'papaparse';
import * as XLSX from 'xlsx';
import { importVoters } from '@/lib/services/voterService';
import { useAuth } from '@/lib/hooks/useAuth';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Select from '@/components/ui/Select';
import { AdminGuard } from '@/components/auth/AuthGuard';
import toast from 'react-hot-toast';

function ImportVoters() {
  const router = useRouter();
  const { user } = useAuth();
  const fileInputRef = useRef(null);
  const [file, setFile] = useState(null);
  const [parsedData, setParsedData] = useState([]);
  const [selectedElection, setSelectedElection] = useState('');
  const [importing, setImporting] = useState(false);
  const [importResult, setImportResult] = useState(null);
  const [elections, setElections] = useState([]);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (!selectedFile) return;

    setFile(selectedFile);
    setImportResult(null);

    const fileExtension = selectedFile.name.split('.').pop().toLowerCase();

    if (fileExtension === 'csv') {
      Papa.parse(selectedFile, {
        header: true,
        complete: (results) => {
          setParsedData(results.data.filter(row => Object.values(row).some(v => v)));
        },
        error: (error) => {
          toast.error('Failed to parse CSV file');
          console.error(error);
        }
      });
    } else if (['xlsx', 'xls'].includes(fileExtension)) {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const workbook = XLSX.read(e.target.result, { type: 'binary' });
          const sheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[sheetName];
          const data = XLSX.utils.sheet_to_json(worksheet);
          setParsedData(data);
        } catch (error) {
          toast.error('Failed to parse Excel file');
          console.error(error);
        }
      };
      reader.readAsBinaryString(selectedFile);
    } else {
      toast.error('Please upload a CSV or Excel file');
      setFile(null);
    }
  };

  const handleImport = async () => {
    if (!selectedElection) {
      toast.error('Please select an election');
      return;
    }

    if (parsedData.length === 0) {
      toast.error('No data to import');
      return;
    }

    setImporting(true);

    // Map parsed data to voter format
    const votersData = parsedData.map(row => ({
      email: row.email || row.Email || '',
      firstName: row.firstName || row.first_name || row['First Name'] || '',
      lastName: row.lastName || row.last_name || row['Last Name'] || '',
      studentId: row.studentId || row.student_id || row['Student ID'] || '',
      gradeLevel: row.gradeLevel || row.grade_level || row['Grade Level'] || '',
      section: row.section || row.Section || '',
      department: row.department || row.Department || '',
      userId: row.userId || row.user_id || ''
    }));

    const result = await importVoters(votersData, selectedElection, user.uid);
    
    setImportResult(result);
    
    if (result.success) {
      toast.success(`Successfully imported ${result.success} voters`);
    } else {
      toast.error('Import failed');
    }

    setImporting(false);
  };

  const downloadTemplate = () => {
    const template = [
      {
        email: 'student@school.edu',
        firstName: 'John',
        lastName: 'Doe',
        studentId: '2024-0001',
        gradeLevel: 'freshman',
        section: 'A',
        department: 'Computer Science'
      }
    ];

    const ws = XLSX.utils.json_to_sheet(template);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Voters');
    XLSX.writeFile(wb, 'voter_import_template.xlsx');
  };

  return (
    <div className="space-y-6 max-w-3xl">
      <Button variant="ghost" onClick={() => router.back()}>
        <ArrowLeft className="w-4 h-4 mr-2" />
        Back
      </Button>

      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Import Voters</h1>
        <p className="text-gray-600 dark:text-gray-400">Upload a CSV or Excel file to import voters</p>
      </div>

      {/* Template Download */}
      <Card>
        <Card.Body className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <FileSpreadsheet className="w-8 h-8 text-green-600" />
            <div>
              <p className="font-medium text-gray-900 dark:text-white">Download Template</p>
              <p className="text-sm text-gray-500">Use this template for proper formatting</p>
            </div>
          </div>
          <Button variant="outline" onClick={downloadTemplate}>
            <Download className="w-4 h-4 mr-2" />
            Download
          </Button>
        </Card.Body>
      </Card>

      {/* File Upload */}
      <Card>
        <Card.Header>
          <h2 className="font-semibold text-gray-900 dark:text-white">Upload File</h2>
        </Card.Header>
        <Card.Body className="space-y-4">
          <div
            onClick={() => fileInputRef.current?.click()}
            className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-8 text-center cursor-pointer hover:border-blue-500 transition-colors"
          >
            <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 dark:text-gray-400 mb-2">
              {file ? file.name : 'Click to upload or drag and drop'}
            </p>
            <p className="text-sm text-gray-500">CSV or Excel files only</p>
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv,.xlsx,.xls"
              onChange={handleFileChange}
              className="hidden"
            />
          </div>

          {parsedData.length > 0 && (
            <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
              <div className="flex items-center gap-2 text-green-700 dark:text-green-300">
                <CheckCircle className="w-5 h-5" />
                <span className="font-medium">{parsedData.length} records found</span>
              </div>
            </div>
          )}
        </Card.Body>
      </Card>

      {/* Preview */}
      {parsedData.length > 0 && (
        <Card>
          <Card.Header>
            <h2 className="font-semibold text-gray-900 dark:text-white">Preview (First 5 rows)</h2>
          </Card.Header>
          <Card.Body className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 dark:bg-gray-800">
                  <tr>
                    {Object.keys(parsedData[0] || {}).slice(0, 6).map((key) => (
                      <th key={key} className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                        {key}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {parsedData.slice(0, 5).map((row, index) => (
                    <tr key={index}>
                      {Object.values(row).slice(0, 6).map((value, i) => (
                        <td key={i} className="px-4 py-2 text-gray-600 dark:text-gray-400">
                          {String(value || '-')}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card.Body>
        </Card>
      )}

      {/* Election Selection */}
      <Card>
        <Card.Header>
          <h2 className="font-semibold text-gray-900 dark:text-white">Select Election</h2>
        </Card.Header>
        <Card.Body>
          <Select
            value={selectedElection}
            onChange={(e) => setSelectedElection(e.target.value)}
            placeholder="Select an election to import voters to"
            options={elections.map(e => ({ value: e.id, label: e.name }))}
          />
          <p className="text-sm text-gray-500 mt-2">
            Voters will be associated with this election for eligibility tracking
          </p>
        </Card.Body>
      </Card>

      {/* Import Result */}
      {importResult && (
        <Card className={importResult.success > 0 ? 'border-green-200' : 'border-red-200'}>
          <Card.Body>
            <div className="flex items-start gap-3">
              {importResult.success > 0 ? (
                <CheckCircle className="w-6 h-6 text-green-600" />
              ) : (
                <AlertCircle className="w-6 h-6 text-red-600" />
              )}
              <div>
                <p className="font-medium text-gray-900 dark:text-white">
                  Import Complete
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Successfully imported: {importResult.success} | Failed: {importResult.failed}
                </p>
                {importResult.errors?.length > 0 && (
                  <div className="mt-2 text-sm text-red-600">
                    {importResult.errors.slice(0, 5).map((err, i) => (
                      <p key={i}>{err.voter}: {err.error}</p>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </Card.Body>
        </Card>
      )}

      {/* Actions */}
      <div className="flex gap-4">
        <Button variant="secondary" onClick={() => router.back()}>
          Cancel
        </Button>
        <Button 
          onClick={handleImport} 
          loading={importing}
          disabled={parsedData.length === 0}
        >
          Import {parsedData.length} Voters
        </Button>
      </div>
    </div>
  );
}

export default function ImportVotersPage() {
  return (
    <AdminGuard>
      <ImportVoters />
    </AdminGuard>
  );
}
