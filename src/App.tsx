import 'primereact/resources/themes/lara-light-indigo/theme.css';
import 'primereact/resources/primereact.min.css';
import 'primeicons/primeicons.css';
import './App.css';

import { useState, useEffect, useRef, useMemo } from 'react';
import { Button } from 'primereact/button';
import { DataTable, DataTableProps } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { OverlayPanel } from 'primereact/overlaypanel';
import { InputText } from 'primereact/inputtext';

// Define types for the artwork data structure
interface Artwork {
  id: number;
  title: string;
  place_of_origin: string;
  artist_display: string;
  inscriptions: string;
  date_start: string;
  date_end: string;
}

function App() {
  const [selectedArtwork, setSelectedArtwork] = useState<Artwork[]>([]);
  const [artwork, setArtwork] = useState<Artwork[]>([]);
  const [totalRecords, setTotalRecords] = useState<number>(0);
  const [currentPageNumber, setCurrentPageNumber] = useState<number>(1);
  const [loading, setLoading] = useState<boolean>(false);
  const [value, setValue] = useState<string>('');
  const op = useRef<OverlayPanel>(null);
  const rowsPerPage = 12;

  const paginatorLeft = (
    <Button
      type="button"
      severity="danger"
      icon="pi pi-chevron-left"
      text
      onClick={() =>
        setCurrentPageNumber(currentPageNumber === 1 ? currentPageNumber : currentPageNumber - 1)
      }
    />
  );

  const paginatorRight = (
    <Button
      type="button"
      severity="danger"
      icon="pi pi-chevron-right"
      text
      onClick={() =>
        setCurrentPageNumber(
          currentPageNumber === Math.ceil(totalRecords / rowsPerPage)
            ? currentPageNumber
            : currentPageNumber + 1
        )
      }
    />
  );

  // Memoize the value of numberOfRowsToSelect based on input value and currentPageNumber
  const numberOfRowsToSelect = useMemo((): number => {
    const parsedValue = parseInt(value, 10);
    return isNaN(parsedValue) || parsedValue <= 0 ? 0 : parsedValue;
  }, [value]);

  const selectRows = (): void => {
    if (numberOfRowsToSelect <= 0) return;

    let remainingRowsToSelect = numberOfRowsToSelect;
    const newSelectedArtwork = [...selectedArtwork];

    artwork.forEach((cus) => {
      if (remainingRowsToSelect > 0 && !newSelectedArtwork.some((selected) => selected.id === cus.id)) {
        newSelectedArtwork.push(cus);
        remainingRowsToSelect--;
      }
    });

    setSelectedArtwork(newSelectedArtwork);
    if (op.current) {
      op.current.hide();
    }
    setValue(remainingRowsToSelect === 0 ? '' : remainingRowsToSelect.toString());
  };

  const handleSelectionChange: DataTableProps<Artwork[]>['onSelectionChange'] = (e) => {
    setSelectedArtwork(e.value || []);
  };

  const setData = async (page: number): Promise<void> => {
    setLoading(true);
    try {
      const response = await fetch(`https://api.artic.edu/api/v1/artworks?page=${page}`);
      const data = await response.json();
      setTotalRecords(data.pagination.total);
      setArtwork(data.data);
    } catch (error) {
      console.error('Failed to fetch data', error);
    }
    setLoading(false);
  };

  useEffect(() => {
    setData(currentPageNumber);
  }, [currentPageNumber]);

  useEffect(() => {
    if (numberOfRowsToSelect > 0) {
      selectRows();
    }
  }, [artwork]);

  return (
    <>
      <div className="card">
        <DataTable
          value={artwork}
          selection={selectedArtwork}
          onSelectionChange={handleSelectionChange}
          paginator
          rows={rowsPerPage}
          loading={loading}
          tableStyle={{ minWidth: '50rem' }}
          paginatorTemplate="CurrentPageReport"
          currentPageReportTemplate={`${currentPageNumber} of ${Math.ceil(totalRecords / rowsPerPage)}`}
          paginatorLeft={paginatorLeft}
          paginatorRight={paginatorRight}
        >
          <Column
            selectionMode="multiple"
            header={
              <>
                <Button
                  type="button"
                  icon="pi pi-chevron-down"
                  onClick={(e) => op.current?.toggle(e)}
                  style={{
                    background: '#64748b',
                    width: '1.8rem',
                    padding: '0rem',
                    marginRight: '5px',
                  }}
                />
                <OverlayPanel ref={op}>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'end' }}>
                    <InputText
                      value={value}
                      onChange={(e) => setValue(e.target.value)}
                      placeholder="Select rows..."
                      style={{ marginBottom: '8px' }}
                    />
                    <Button label="Submit" style={{ width: '50%' }} severity="secondary" onClick={selectRows} />
                  </div>
                </OverlayPanel>
              </>
            }
            style={{ textAlign: 'right' }}
          />
          <Column field="title" header="Title" style={{ width: '20%' }}></Column>
          <Column field="place_of_origin" header="Place of origin" style={{ width: '20%' }}></Column>
          <Column field="artist_display" header="Artist display" style={{ width: '20%' }}></Column>
          <Column field="inscriptions" header="Inscriptions" style={{ width: '20%' }}></Column>
          <Column field="date_start" header="Start date" style={{ width: '10%' }}></Column>
          <Column field="date_end" header="End date" style={{ width: '10%' }}></Column>
        </DataTable>
      </div>
    </>
  );
}

export default App;
