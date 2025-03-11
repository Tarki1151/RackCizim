import json
import pandas as pd
import sys

def validate_excel(df):
    required_columns = ['No', 'Owner', 'BrandModel', 'Serial', 'Rack', 'U']
    errors = []
    
    # Sütunlar mevcut mu kontrol et
    missing_cols = [col for col in required_columns if col not in df.columns]
    if missing_cols:
        errors.append(f"Eksik sütunlar: {missing_cols}")
        return errors
    
    for index, row in df.iterrows():
        rack_str = str(row['Rack']).strip()
        u_str = str(row['U']).strip().upper()
        
        # Rack sayısal bir değer olmalı
        if not pd.isna(row['Rack']) and not rack_str.replace('.', '').isdigit():
            errors.append(f"Satır {index+2}: Rack sayısal bir değer olmalı (Geçersiz: {rack_str})")
        
        # U sayısal veya 'BLADE' olmalı
        if not pd.isna(row['U']):
            if u_str != 'BLADE' and not u_str.replace('.', '').isdigit():
                errors.append(f"Satır {index+2}: U sayısal veya 'BLADE' olmalı (Geçersiz: {u_str})")
    
    return errors

def process_file(file_path):
    xl = pd.ExcelFile(file_path)
    cabinets = {}
    all_errors = {}
    
    for sheet in xl.sheet_names:
        # İlk iki satırı oku, başlık satırını bul
        df_preview = pd.read_excel(file_path, sheet_name=sheet, nrows=2)
        header_row = 0
        if 'No' not in df_preview.columns:
            header_row = 1  # İkinci satır başlık olabilir
        
        # Excel’i doğru başlık satırıyla oku
        df = pd.read_excel(file_path, sheet_name=sheet, header=header_row)
        
        # Boş satırları filtrele
        df = df.dropna(how='all')
        # Gerekli sütunların en az biri dolu olan satırları tut
        required_cols = ['No', 'Owner', 'BrandModel', 'Serial', 'Rack', 'U']
        if not all(col in df.columns for col in required_cols):
            all_errors[sheet] = [f"Gerekli sütunlar eksik: {required_cols}"]
            continue
        
        df = df[df[required_cols].notna().any(axis=1)]
        if df.empty:
            continue
        
        errors = validate_excel(df)
        if errors:
            all_errors[sheet] = errors
        else:
            # NaN değerlerini boş string ile değiştir
            df = df.fillna('')
            cabinets[sheet] = df.to_dict('records')
    
    if all_errors and not cabinets:
        return {'errors': all_errors}
    return cabinets

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print(json.dumps({'error': 'Dosya yolu belirtilmedi'}))
    else:
        file_path = sys.argv[1]
        result = process_file(file_path)
        print(json.dumps(result))