use hound::{WavSpec, WavWriter};
use std::io::Cursor;

pub fn samples_to_wav(samples: &[f32], sample_rate: u32) -> Result<Vec<u8>, String> {
    let spec = WavSpec {
        channels: 1,
        sample_rate,
        bits_per_sample: 16,
        sample_format: hound::SampleFormat::Int,
    };

    let mut cursor = Cursor::new(Vec::new());
    {
        let mut writer = WavWriter::new(&mut cursor, spec).map_err(|e| e.to_string())?;

        for sample in samples {
            // Convert f32 [-1.0, 1.0] to i16
            let amplitude = (*sample * i16::MAX as f32).clamp(i16::MIN as f32, i16::MAX as f32) as i16;
            writer.write_sample(amplitude).map_err(|e| e.to_string())?;
        }

        writer.finalize().map_err(|e| e.to_string())?;
    }

    Ok(cursor.into_inner())
}
